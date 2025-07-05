import React from 'react';

/**
 * Product Card Skeleton Component
 * Displays a loading placeholder for product cards
 */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image Placeholder */}
      <div className="bg-gray-200 w-full" style={{ aspectRatio: '1' }}></div>
      
      {/* Product Info Placeholder */}
      <div className="flex flex-col p-4 flex-grow">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        
        {/* Capacity */}
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        
        {/* Description */}
        <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
        
        <div className="mt-auto">
          {/* Price */}
          <div className="flex items-baseline mb-2">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
          
          {/* ROI Info */}
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-2/5"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  );
}

/**
 * Product Grid Skeleton Component
 * Displays multiple product card skeletons in a grid
 */
interface ProductGridSkeletonProps {
  count?: number;
}

export function ProductGridSkeleton({ count = 6 }: ProductGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
