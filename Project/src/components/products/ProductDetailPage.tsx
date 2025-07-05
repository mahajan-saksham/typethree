/**
 * Product Detail Page Component
 * Displays detailed information about a product with variant selection
 */

import React, { useState, useEffect } from 'react';
import { useProduct } from '@/hooks/useProducts';
import { ResponsiveImage } from '@/components/ui/image/ResponsiveImage';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { ProductVariant } from '@/types/product';
import { calculateProductROI } from '@/utils/productDatabase';

interface ProductDetailPageProps {
  slug: string;
}

export function ProductDetailPage({ slug }: ProductDetailPageProps) {
  const { product, isLoading, error, mutate } = useProduct(slug);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Set selected variant to default variant or first variant when product loads
  useEffect(() => {
    if (product?.variants) {
      const defaultVariant = product.variants.find(v => v.is_default) || product.variants[0];
      setSelectedVariant(defaultVariant);
    }
  }, [product]);
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          {/* Breadcrumb Placeholder */}
          <div className="flex items-center text-sm mb-8">
            <div className="bg-gray-200 h-4 w-20 rounded"></div>
            <div className="mx-2">/</div>
            <div className="bg-gray-200 h-4 w-32 rounded"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Section Placeholder */}
            <div>
              <div className="bg-gray-200 rounded-lg w-full" style={{ aspectRatio: '1' }}></div>
              
              <div className="grid grid-cols-4 gap-4 mt-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-gray-200 rounded-lg" style={{ aspectRatio: '1' }}></div>
                ))}
              </div>
            </div>
            
            {/* Info Section Placeholder */}
            <div>
              <div className="bg-gray-200 h-8 w-3/4 rounded mb-4"></div>
              <div className="bg-gray-200 h-4 w-1/2 rounded mb-8"></div>
              
              <div className="bg-gray-200 h-6 w-1/3 rounded mb-4"></div>
              <div className="flex space-x-4 mb-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-gray-200 h-10 w-20 rounded"></div>
                ))}
              </div>
              
              <div className="bg-gray-200 h-6 w-1/4 rounded mb-4"></div>
              <div className="bg-gray-200 h-8 w-1/3 rounded mb-8"></div>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-gray-200 p-6 rounded-lg">
                    <div className="bg-gray-300 h-10 w-10 mx-auto rounded-full mb-4"></div>
                    <div className="bg-gray-300 h-4 w-2/3 mx-auto rounded mb-2"></div>
                    <div className="bg-gray-300 h-4 w-1/2 mx-auto rounded"></div>
                  </div>
                ))}
              </div>
              
              <div className="bg-gray-200 h-12 rounded mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage 
          message="Failed to load product details. Please try again later."
          onRetry={() => mutate()}
        />
      </div>
    );
  }
  
  // Handle case where product is not found
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage 
          message="Product not found."
          type="info"
        />
      </div>
    );
  }
  
  // Calculate ROI metrics if variant is selected
  const roi = selectedVariant ? calculateProductROI(selectedVariant) : null;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm mb-8">
        <a href="/" className="text-gray-500 hover:text-gray-900">Home</a>
        <span className="mx-2 text-gray-400">/</span>
        <a href="/products" className="text-gray-500 hover:text-gray-900">Products</a>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900">{product.name}</span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div>
          {/* Main Image */}
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            {product.images && product.images.length > 0 ? (
              <ResponsiveImage
                src={product.images[selectedImageIndex].url}
                alt={product.images[selectedImageIndex].alt_text || product.name}
                className="w-full"
                aspectRatio={1}
                size="large"
              />
            ) : (
              <div className="w-full bg-gray-100 flex items-center justify-center" style={{ aspectRatio: '1' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`rounded-lg overflow-hidden border-2 ${
                    index === selectedImageIndex 
                      ? 'border-primary' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ResponsiveImage
                    src={image.url}
                    alt={image.alt_text || `${product.name} image ${index + 1}`}
                    className="w-full"
                    aspectRatio={1}
                    size="thumbnail"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          
          {/* Category */}
          <div className="flex mb-6">
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {product.category?.name || 'Solar Product'}
            </span>
          </div>
          
          {/* Variant Selection */}
          {product.variants && product.variants.length > 0 && (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Select {product.variant_name || 'Capacity'}
              </h3>
              <div className="flex flex-wrap gap-3 mb-6">
                {product.variants.map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedVariant?.id === variant.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {variant.capacity_kw} kW
                  </button>
                ))}
              </div>
            </>
          )}
          
          {/* Price Section */}
          {selectedVariant && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-700 mb-2">Price:</h3>
              
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{roi?.subsidizedPrice.toLocaleString()}
                </span>
                
                {product.has_subsidy && selectedVariant.subsidy_percentage > 0 && (
                  <>
                    <span className="ml-3 text-lg line-through text-gray-500">
                      ₹{selectedVariant.price.toLocaleString()}
                    </span>
                    <span className="ml-2 text-sm font-medium text-green-600">
                      {selectedVariant.subsidy_percentage}% off
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* ROI Stats */}
          {selectedVariant && roi && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Monthly Savings</h4>
                <p className="text-xl font-bold text-gray-900">₹{roi.monthlySavings.toLocaleString()}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Payback Period</h4>
                <p className="text-xl font-bold text-gray-900">{Math.round(roi.paybackYears)} years</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">25 Year Savings</h4>
                <p className="text-xl font-bold text-gray-900">₹{roi.twentyFiveYearSavings.toLocaleString()}</p>
              </div>
            </div>
          )}
          
          {/* CTA Button */}
          <a 
            href={`https://wa.me/918095508066?text=I'm%20interested%20in%20${encodeURIComponent(product.name)}${selectedVariant ? `%20(${selectedVariant.capacity_kw}kW%20variant)` : ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full block text-center py-3 px-4 bg-green-600 text-white rounded-lg font-medium text-lg transition-colors hover:bg-green-700 mb-8"
          >
            Enquire on WhatsApp
          </a>
          
          {/* Description */}
          {product.description && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <div className="prose prose-gray max-w-none">
                <p>{product.description}</p>
              </div>
            </div>
          )}
          
          {/* Features */}
          {product.features?.highlights && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
              <ul className="list-disc pl-5 space-y-2">
                {product.features.highlights.map((feature, index) => (
                  <li key={index} className="text-gray-700">{feature}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <tr key={key}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                          {Array.isArray(value) ? value.join(', ') : value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
