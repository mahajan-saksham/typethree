/**
 * List Product Images API Endpoint
 * GET /api/products/images?productId=...
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { validateQuery } from '@/utils/apiValidation';
import { z } from 'zod';
import { invalidateCache } from '@/utils/apiCache';

// Schema for query parameters
const QuerySchema = z.object({
  productId: z.string().uuid()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate query parameters
  const validated = validateQuery(req, res, QuerySchema);
  if (!validated) return;

  const { productId } = validated;

  try {
    // Get images for the product
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('display_order');

    if (error) {
      console.error('Error fetching product images:', error);
      return res.status(500).json({ error: 'Failed to fetch product images' });
    }

    return res.status(200).json({ images: data });
  } catch (error) {
    console.error('Unhandled error in product images API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
