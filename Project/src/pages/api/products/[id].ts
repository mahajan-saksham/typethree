// src/pages/api/products/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { secureApi } from '../../../server/apiClient';
import { supabase } from '../../../lib/supabaseClient';

/**
 * API handler for /api/products/[id]
 * Securely retrieves product data server-side
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get product ID from query params
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return handleGetProduct(req, res, id);
    case 'PUT':
      return handleUpdateProduct(req, res, id);
    case 'DELETE':
      return handleDeleteProduct(req, res, id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * Handle GET request for a single product
 */
async function handleGetProduct(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    // Use secure API to get product
    const { data, error } = await secureApi.getProductById(id);

    if (error) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Add cache headers
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    
    // Return product data
    return res.status(200).json({ product: data });
  } catch (error: any) {
    console.error(`API error in /api/products/${id}:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Handle PUT request to update a product
 * Requires admin authentication
 */
async function handleUpdateProduct(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    // Get user session
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get product data from request body
    const productData = req.body;

    if (!productData) {
      return res.status(400).json({ error: 'Missing product data' });
    }

    // Use secure API to update product
    const { data, error } = await secureApi.updateProduct(id, productData, session.user.id);

    if (error === 'Admin privileges required') {
      return res.status(403).json({ error });
    }

    if (error) {
      return res.status(500).json({ error });
    }
    
    // Return updated product
    return res.status(200).json({ product: data });
  } catch (error: any) {
    console.error(`API error in /api/products/${id}:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Handle DELETE request to delete a product
 * Requires admin authentication
 */
async function handleDeleteProduct(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  // This would be implemented similarly to handleUpdateProduct
  // with proper admin authentication checks
  return res.status(501).json({ error: 'Not implemented' });
}
