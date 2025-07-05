/**
 * Update Product Image API Endpoint
 * PATCH /api/products/images/[id]
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { validateBody, validateQuery } from '@/utils/apiValidation';
import { z } from 'zod';
import { invalidateCache } from '@/utils/apiCache';

// Schema for path parameters
const PathSchema = z.object({
  id: z.string().uuid()
});

// Schema for request body
const UpdateSchema = z.object({
  altText: z.string().optional(),
  isPrimary: z.boolean().optional(),
  displayOrder: z.number().optional()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow PATCH requests
  if (req.method !== 'PATCH') {
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

  // Validate request body
  const body = validateBody(req, res, UpdateSchema);
  if (!body) return;

  const { id } = pathParams;
  const { altText, isPrimary, displayOrder } = body;

  try {
    // Get the current image data
    const { data: image, error: fetchError } = await supabase
      .from('product_images')
      .select('product_id, is_primary')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Image not found' });
      }
      throw fetchError;
    }

    // If changing to primary, update other images
    if (isPrimary && !image.is_primary) {
      await supabaseAdmin
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', image.product_id);
    }

    // Update the image
    const updates: any = {};
    if (altText !== undefined) updates.alt_text = altText;
    if (isPrimary !== undefined) updates.is_primary = isPrimary;
    if (displayOrder !== undefined) updates.display_order = displayOrder;

    const { data, error } = await supabaseAdmin
      .from('product_images')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating image:', error);
      return res.status(500).json({ error: 'Failed to update image' });
    }

    // Invalidate caches
    invalidateCache(['products', 'product-detail']);

    return res.status(200).json({ image: data });
  } catch (error) {
    console.error('Unhandled error in update image API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
