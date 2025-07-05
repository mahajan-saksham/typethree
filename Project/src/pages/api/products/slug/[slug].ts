/**
 * Get Product by Slug API Endpoint
 * GET /api/products/slug/[slug]
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withCache } from '@/utils/apiCache';
import { validateQuery, ProductSlugSchema } from '@/utils/apiValidation';
import { getProductBySlug } from '@/utils/productDatabase';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate product slug
  const validatedParams = validateQuery(req, res, ProductSlugSchema);
  if (!validatedParams) return;

  const { slug } = validatedParams;

  try {
    // Get product with all related data
    const { data: product, error } = await getProductBySlug(slug);

    if (error) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Add default variant reference
    if (product?.variants) {
      product.default_variant = product.variants.find(v => v.is_default) || product.variants[0];
    }

    return product;
  } catch (error) {
    console.error('Unhandled error in product slug API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Export the handler with caching
export default withCache(handler, {
  duration: 300, // 5 minutes cache
  tags: ['products', 'product-detail']
});
