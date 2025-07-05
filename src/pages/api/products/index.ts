// src/pages/api/products/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { secureApi } from '../../../server/apiClient';
import { supabase } from '../../../lib/supabaseClient';

/**
 * API handler for /api/products
 * Securely retrieves product data server-side
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user session
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;

    // Authentication check (optional - decide if products should be public)
    // if (!session) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }

    // Use secure API to get products
    const { data, error } = await secureApi.getProducts();

    if (error) {
      return res.status(500).json({ error });
    }

    // Add cache headers
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    
    // Return products data
    return res.status(200).json({ products: data });
  } catch (error: any) {
    console.error('API error in /api/products:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
