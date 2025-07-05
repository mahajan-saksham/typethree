/**
 * Upload Product Image API Endpoint
 * POST /api/products/images/upload
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { validateBody } from '@/utils/apiValidation';
import { z } from 'zod';
import { PRODUCT_IMAGES_BUCKET } from '@/utils/image/storage';
import { v4 as uuidv4 } from 'uuid';
import { invalidateCache } from '@/utils/apiCache';
import formidable from 'formidable';
import fs from 'fs';

// Disable the default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Schema for metadata
const MetadataSchema = z.object({
  productId: z.string().uuid(),
  altText: z.string().optional(),
  isPrimary: z.boolean().optional(),
  displayOrder: z.number().optional()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check admin status
  const { data: isAdmin } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', session.user.id)
    .single();

  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    // Parse form with formidable
    const form = new formidable.IncomingForm({
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    return new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Error parsing form:', err);
          res.status(400).json({ error: 'Error parsing upload form' });
          return resolve(true);
        }

        try {
          // Validate metadata
          const metadata = JSON.parse(fields.metadata as string);
          const validated = MetadataSchema.parse(metadata);
          const { productId, altText, isPrimary, displayOrder } = validated;

          // Get the file
          const file = files.file as formidable.File;
          if (!file) {
            res.status(400).json({ error: 'No file uploaded' });
            return resolve(true);
          }

          // Validate file type
          if (!file.mimetype || !file.mimetype.startsWith('image/')) {
            res.status(400).json({ error: 'File must be an image' });
            return resolve(true);
          }

          // Generate filename and path
          const fileExt = file.originalFilename?.split('.').pop() || 'jpg';
          const fileName = `${uuidv4()}.${fileExt}`;
          const filePath = `${productId}/${fileName}`;

          // Read file
          const fileData = fs.readFileSync(file.filepath);

          // Upload to Supabase Storage
          const { error: uploadError } = await supabaseAdmin.storage
            .from(PRODUCT_IMAGES_BUCKET)
            .upload(filePath, fileData, {
              contentType: file.mimetype,
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            throw uploadError;
          }

          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from(PRODUCT_IMAGES_BUCKET)
            .getPublicUrl(filePath);

          // If this is the primary image, update other images
          if (isPrimary) {
            await supabaseAdmin
              .from('product_images')
              .update({ is_primary: false })
              .eq('product_id', productId);
          }

          // Create database record
          const { data: imageData, error: dbError } = await supabaseAdmin
            .from('product_images')
            .insert({
              product_id: productId,
              url: publicUrl,
              alt_text: altText || '',
              is_primary: isPrimary || false,
              display_order: displayOrder || 0
            })
            .select()
            .single();

          if (dbError) {
            throw dbError;
          }

          // Invalidate caches
          invalidateCache(['products', 'product-detail']);

          res.status(200).json({ image: imageData });
          return resolve(true);
        } catch (error) {
          console.error('Error handling upload:', error);
          res.status(500).json({ error: 'Failed to upload image' });
          return resolve(true);
        }
      });
    });
  } catch (error) {
    console.error('Unhandled error in image upload API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
