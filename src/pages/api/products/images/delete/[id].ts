/**
 * Delete Product Image API Endpoint
 * DELETE /api/products/images/delete/[id]
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { validateQuery } from '@/utils/apiValidation';
import { z } from 'zod';
import { PRODUCT_IMAGES_BUCKET } from '@/utils/image/storage';
import { invalidateCache } from '@/utils/apiCache';

// Schema for path parameters
const PathSchema = z.object({
  id: z.string().uuid()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow DELETE requests
  if (req.method !== 'DELETE') {
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

  // Validate path parameters
  const pathParams = validateQuery(req, res, PathSchema);
  if (!pathParams) return;

  const { id } = pathParams;

  try {
    // Get the image record first to find the storage path
    const { data: image, error: fetchError } = await supabase
      .from('product_images')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Image not found' });
      }
      throw fetchError;
    }

    // Extract file path from URL
    const url = new URL(image.url);
    const pathWithBucket = url.pathname;

    // Path is usually in format: /storage/v1/object/public/bucket-name/path
    // We need just the path part
    const parts = pathWithBucket.split('/');
    const bucketIndex = parts.indexOf('public') + 1;
    const path = parts.slice(bucketIndex + 1).join('/');

    // Delete from storage
    const { error: storageError } = await supabaseAdmin.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .remove([path]);

    if (storageError) {
      console.error('Error deleting from storage:', storageError);
      // Continue even if storage deletion fails, as file might be already deleted
    }

    // Delete from database
    const { error: dbError } = await supabaseAdmin
      .from('product_images')
      .delete()
      .eq('id', id);

    if (dbError) {
      throw dbError;
    }

    // If image was primary, set another image as primary
    if (image.is_primary) {
      const { data: images } = await supabase
        .from('product_images')
        .select('id')
        .eq('product_id', image.product_id)
        .order('display_order')
        .limit(1);

      if (images && images.length > 0) {
        await supabaseAdmin
          .from('product_images')
          .update({ is_primary: true })
          .eq('id', images[0].id);
      }
    }

    // Invalidate caches
    invalidateCache(['products', 'product-detail']);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Unhandled error in delete image API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
