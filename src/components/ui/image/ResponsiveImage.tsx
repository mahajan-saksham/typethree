/**
 * Responsive Image Component
 * Renders optimized images with proper srcset and lazy loading
 */

import React, { useState } from 'react';
import { getOptimizedImageUrl, getImageDimensions, ImageSize } from '@/utils/image/storage';

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Main image URL */
  src: string;
  
  /** Alternative text for accessibility */
  alt: string;
  
  /** Enable lazy loading */
  lazy?: boolean;
  
  /** Show loading placeholder */
  showPlaceholder?: boolean;
  
  /** Image aspect ratio (width/height) */
  aspectRatio?: number;
  
  /** Object fit style */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  
  /** Custom CSS classes */
  className?: string;
  
  /** Size variant for the main image */
  size?: ImageSize;
  
  /** Include srcset for responsive images */
  responsive?: boolean;
}

export function ResponsiveImage({
  src,
  alt,
  lazy = true,
  showPlaceholder = true,
  aspectRatio = 1, // Default to square
  objectFit = 'cover',
  className = '',
  size = 'medium',
  responsive = true,
  ...props
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // Calculate placeholder dimensions
  const dimensions = getImageDimensions(size);
  
  // Get the main image URL with optimizations
  const optimizedSrc = getOptimizedImageUrl(src, size);
  
  // Prepare srcset if responsive is true
  const srcSet = responsive
    ? [
        `${getOptimizedImageUrl(src, 'thumbnail')} 200w`,
        `${getOptimizedImageUrl(src, 'small')} 400w`,
        `${getOptimizedImageUrl(src, 'medium')} 800w`,
        `${getOptimizedImageUrl(src, 'large')} 1200w`
      ].join(', ')
    : undefined;
  
  // Prepare sizes attribute if responsive is true
  const sizes = responsive
    ? '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
    : undefined;
  
  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  // Handle image error
  const handleError = () => {
    setError(true);
    console.error(`Failed to load image: ${src}`);
  };
  
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ 
        aspectRatio: aspectRatio.toString(), 
        backgroundColor: '#f4f4f4' // Light gray background for placeholder
      }}
    >
      {/* Image placeholder */}
      {showPlaceholder && !isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Fallback for error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      {/* Actual image */}
      <img
        src={optimizedSrc}
        alt={alt}
        srcSet={srcSet}
        sizes={sizes}
        loading={lazy ? 'lazy' : undefined}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-${objectFit} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        {...props}
      />
    </div>
  );
}
