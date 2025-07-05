/**
 * Products Page Component
 * Displays a grid of product cards with filtering and pagination
 */

import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductGridSkeleton } from '@/components/products/ProductSkeleton';
import { ErrorMessage } from '../ui/ErrorMessage';

interface ProductsPageProps {
  initialCategory?: string;
  initialUseCase?: string;
}

export function ProductsPage({ initialCategory, initialUseCase }: ProductsPageProps) {
  // State for filters
  const [filters, setFilters] = useState({
    category: initialCategory || '',
    useCase: initialUseCase || '',
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    hasSubsidy: undefined as boolean | undefined,
    sortBy: 'name'
  });
  
  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 12;
  
  // Fetch products with SWR
  const { products, pagination, isLoading, error, mutate } = useProducts({
    page,
    limit,
    category: filters.category || undefined,
    useCase: filters.useCase || undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    hasSubsidy: filters.hasSubsidy,
    sortBy: filters.sortBy
  });
  
  // Handle filter changes
  const handleFilterChange = (name: string, value: any) => {
    // Reset to page 1 when filters change
    setPage(1);
    
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle sort change
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    handleFilterChange('sortBy', event.target.value);
  };
  
  // Handle category filter
  const handleCategoryFilter = (category: string) => {
    handleFilterChange('category', category === filters.category ? '' : category);
  };
  
  // Handle use case filter
  const handleUseCaseFilter = (useCase: string) => {
    handleFilterChange('useCase', useCase === filters.useCase ? '' : useCase);
  };
  
  // Handle subsidy filter
  const handleSubsidyFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange('hasSubsidy', event.target.checked ? true : undefined);
  };
  
  // Handle price filter
  const handlePriceFilter = (min?: number, max?: number) => {
    setFilters(prev => ({
      ...prev,
      minPrice: min,
      maxPrice: max
    }));
    
    // Reset to page 1
    setPage(1);
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Solar Products</h1>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                filters.category === '' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleCategoryFilter('')}
            >
              All
            </button>
            <button
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                filters.category === 'residential' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleCategoryFilter('residential')}
            >
              Residential
            </button>
            <button
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                filters.category === 'commercial' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleCategoryFilter('commercial')}
            >
              Commercial
            </button>
            <button
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                filters.category === 'industrial' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleCategoryFilter('industrial')}
            >
              Industrial
            </button>
          </div>
          
          {/* Sort Dropdown */}
          <div className="flex items-center">
            <label htmlFor="sort" className="text-sm text-gray-700 mr-2">
              Sort by:
            </label>
            <select
              id="sort"
              value={filters.sortBy}
              onChange={handleSortChange}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="name">Name</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
        
        {/* Additional Filters */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-6">
            {/* Subsidy Filter */}
            <div className="flex items-center">
              <input
                id="subsidy-filter"
                type="checkbox"
                checked={filters.hasSubsidy === true}
                onChange={handleSubsidyFilter}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="subsidy-filter" className="ml-2 text-sm text-gray-700">
                Show only products with subsidy
              </label>
            </div>
            
            {/* Price Range Filters */}
            <div className="flex items-center gap-4">
              <button
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  filters.minPrice === undefined && filters.maxPrice === undefined 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handlePriceFilter(undefined, undefined)}
              >
                All Prices
              </button>
              <button
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  filters.minPrice === undefined && filters.maxPrice === 100000 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handlePriceFilter(undefined, 100000)}
              >
                Under ₹1 Lakh
              </button>
              <button
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  filters.minPrice === 100000 && filters.maxPrice === 200000 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handlePriceFilter(100000, 200000)}
              >
                ₹1-2 Lakh
              </button>
              <button
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  filters.minPrice === 200000 && filters.maxPrice === undefined 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handlePriceFilter(200000, undefined)}
              >
                Above ₹2 Lakh
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Products Grid */}
      <div className="mb-8">
        {isLoading ? (
          <ProductGridSkeleton count={limit} />
        ) : error ? (
          <ErrorMessage 
            message="Failed to load products. Please try again later."
            onRetry={() => mutate()}
          />
        ) : products.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">
              Try adjusting your filters to see more results.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {!isLoading && !error && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                page === 1 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Page Numbers */}
            {Array.from({ length: pagination.totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              
              // Show first, last, and pages around current page
              if (
                pageNumber === 1 ||
                pageNumber === pagination.totalPages ||
                (pageNumber >= page - 1 && pageNumber <= page + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === pageNumber
                        ? 'z-10 bg-primary border-primary text-white'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              }
              
              // Show ellipsis
              if (
                (pageNumber === 2 && page > 3) ||
                (pageNumber === pagination.totalPages - 1 && page < pagination.totalPages - 2)
              ) {
                return (
                  <span
                    key={pageNumber}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>
                );
              }
              
              return null;
            })}
            
            {/* Next Button */}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === pagination.totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                page === pagination.totalPages 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
