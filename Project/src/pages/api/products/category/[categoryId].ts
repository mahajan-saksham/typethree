/**
 * Get Products by Category API Endpoint
 * GET /api/products/category/[categoryId]
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withCache } from '@/utils/apiCache';
import { validateQuery, CategoryIdSchema, PaginationSchema } from '@/utils/apiValidation';
import { getProductsWithDefaultVariants } from '@/utils/productDatabase';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate category ID and pagination
  const validatedParams = validateQuery(req, res, CategoryIdSchema);
  if (!validatedParams) return;

  const validatedQuery = validateQuery(req, res, PaginationSchema);
  if (!validatedQuery) return;

  const { categoryId } = validatedParams;
  const { page, limit } = validatedQuery;

  // Calculate pagination parameters
  const offset = (page - 1) * limit;

  try {
    // Get products from the database
    const { data: products, error } = await getProductsWithDefaultVariants({
      categories: [categoryId],
      limit,
      offset,
      orderBy: 'name'
    });

    if (error) {
      console.error('Error fetching products by category:', error);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }

    // Calculate total count for pagination
    const total = products?.length || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      products: products || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    console.error('Unhandled error in products by category API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Export the handler with caching
export default withCache(handler, {
  duration: 300, // 5 minutes cache
  tags: ['products', 'product-category']
});
