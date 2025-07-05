// src/components/ProductsListSecure.tsx
import React, { useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';

/**
 * ProductsList component that uses the secure API
 * This replaces direct Supabase client usage with secure server-side API calls
 */
const ProductsListSecure: React.FC = () => {
  const { products, error, isLoading, refreshProducts } = useProducts();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="p-4">
        <p>Loading products...</p>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-4">
        <p className="text-error">Error: {error.message}</p>
        <button 
          className="mt-2 px-4 py-2 bg-primary text-dark rounded-lg"
          onClick={() => refreshProducts()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Handle empty state
  if (!products || products.length === 0) {
    return (
      <div className="p-4">
        <p>No products found.</p>
      </div>
    );
  }

  // Render products
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {products.map((product) => (
        <div key={product.id} className="border p-4 rounded-lg">
          <h3 className="text-xl font-bold">{product.name}</h3>
          <p className="text-sm text-light/60">{product.description}</p>
          <p className="mt-2 font-medium">${(product.price / 100).toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductsListSecure;
