// src/server/apiClient.ts
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a server-side Supabase client that bypasses client-side RLS
 * This is intended for use only in server-side API routes
 */
export function createServerSupabaseClient(headers: Record<string, string>): SupabaseClient {
  // Get URL and service role key from environment variables
  const supabaseUrl = process.env.SUPABASE_URL || 'https://dtuoyawpebjcmfesgwwn.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not defined');
    throw new Error('Missing server-side credentials');
  }

  // Create client with service role key
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        // Forward authorization header if present
        ...(headers.authorization && { Authorization: headers.authorization })
      }
    }
  });
}

/**
 * Server-side secure database methods
 * These methods should only be called from API routes
 */
export const secureApi = {
  /**
   * Get product data with caching
   */
  async getProducts() {
    try {
      const { data, error } = await supabaseAdmin
        .from('product_skus')
        .select(`
          *,
          product_categories(id, name, icon_name),
          product_variants(*)
        `)
        .order('name');

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching products:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get a single product by ID
   */
  async getProductById(id: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('product_skus')
        .select(`
          *,
          product_categories(id, name, icon_name),
          product_variants(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error: any) {
      console.error(`Error fetching product ${id}:`, error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Update a product (admin only)
   */
  async updateProduct(id: string, productData: any, userId: string) {
    try {
      // First check if user is an admin
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        throw new Error('Unauthorized');
      }

      if (profile?.role !== 'admin') {
        throw new Error('Admin privileges required');
      }

      // Update the product
      const { data, error } = await supabaseAdmin
        .from('product_skus')
        .update({
          ...productData,
          updated_at: new Date().toISOString(),
          updated_by: userId
        })
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error: any) {
      console.error(`Error updating product ${id}:`, error);
      return { data: null, error: error.message };
    }
  },

  // Add more secure API methods as needed...
};
