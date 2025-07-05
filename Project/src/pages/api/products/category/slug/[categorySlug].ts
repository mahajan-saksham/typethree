/**
 * Get Products by Category Slug API Endpoint
 * GET /api/products/category/slug/[categorySlug]
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withCache } from '@/utils/apiCache';
import { validateQuery, CategorySlugSchema, PaginationSchema } from '@/utils/apiValidation';
import { supabase } from '@/lib/supabaseClient';
import { getProductsWithDefaultVariants } from '@/utils/productDatabase';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate category slug and pagination
  const validatedParams = validateQuery(req, res, CategorySlugSchema);
  if (!validatedParams) return;

  const validatedQuery = validateQuery(req, res, PaginationSchema);
  if (!validatedQuery) return;

  const { categorySlug } = validatedParams;
  const { page, limit } = validatedQuery;

  try {
    // First, get the category ID from the slug
    const { data: category, error: categoryError } = await supabase
      .from('product_categories')
      .select('id')
      .eq('slug', categorySlug)
      .eq('is_active', true)
      .single();

    if (categoryError) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Calculate pagination parameters
    const offset = (page - 1) * limit;

    // Get products from the database
    const { data: products, error } = await getProductsWithDefaultVariants({
      categories: [category.id],
      limit,
      offset,
      orderBy: 'name'
    });

    if (error) {
      console.error('Error fetching products by category slug:', error);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }

    // Calculate total count for pagination
    const total = products?.length || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      products: products || [],
      category: {
        id: category.id,
        slug: categorySlug
      },
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
    console.error('Unhandled error in products by category slug API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Export the handler with caching
export default withCache(handler, {
  duration: 300, // 5 minutes cache
  tags: ['products', 'product-category']
});
