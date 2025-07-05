// src/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { useSecureApi } from './useSecureApi';

/**
 * Product data interface
 */
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  // Add other fields as needed
}

/**
 * Hook for fetching and managing product data
 * Uses the secure API instead of direct Supabase calls
 */
export function useProducts() {
  const { data, error, isLoading, fetchData } = useSecureApi<{ products: Product[] }>();
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch products on component mount
  useEffect(() => {
    fetchData('products');
  }, [fetchData]);

  // Update products when data changes
  useEffect(() => {
    if (data?.products) {
      setProducts(data.products);
    }
  }, [data]);

  /**
   * Get a single product by ID
   */
  const getProduct = async (id: string) => {
    const result = await fetchData(`products/${id}`);
    return result?.product;
  };

  return {
    products,
    error,
    isLoading,
    getProduct,
    refreshProducts: () => fetchData('products')
  };
}
