/**
 * Image Upload Component
 * Handles uploading and managing product images
 */

import React, { useState, useRef } from 'react';
import { uploadProductImage, deleteProductImage, updateProductImageMetadata } from '@/utils/image/storage';
import { ProductImage } from '@/types/product';
import { ResponsiveImage } from './ResponsiveImage';

interface ImageUploadProps {
  /** Product ID to associate the image with */
  productId: string;
  
  /** Initial images */
  initialImages?: ProductImage[];
  
  /** Callback when images change */
  onChange?: (images: ProductImage[]) => void;
  
  /** Maximum number of images allowed */
  maxImages?: number;
  
  /** Allow reordering images */
  allowReordering?: boolean;
}

export function ImageUpload({
  productId,
  initialImages = [],
  onChange,
  maxImages = 10,
  allowReordering = true
}: ImageUploadProps) {
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Check if we've hit the max images limit
    if (images.length + files.length > maxImages) {
      setError(`You can only upload a maximum of ${maxImages} images`);
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    // Upload each file
    const newImages: ProductImage[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Set as primary if it's the first image
        const isPrimary = images.length === 0 && newImages.length === 0;
        
        // Calculate the next display order
        const maxOrder = Math.max(0, ...images.map(img => img.display_order));
        const displayOrder = maxOrder + 1 + newImages.length;
        
        // Upload the image
        const { data, error } = await uploadProductImage({
          productId,
          file,
          isPrimary,
          displayOrder,
          onProgress: (progress) => {
            setUploadProgress(progress);
          }
        });
        
        if (error) throw error;
        if (data) newImages.push(data);
        
      } catch (err) {
        console.error('Upload error:', err);
        setError(`Error uploading ${file.name}: ${err.message}`);
      }
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Update images state
    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    
    // Trigger onChange callback
    if (onChange) {
      onChange(updatedImages);
    }
    
    setIsUploading(false);
    setUploadProgress(0);
  };
  
  // Handle image deletion
  const handleDelete = async (imageId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this image?');
    if (!confirmDelete) return;
    
    try {
      setError(null);
      const { success, error } = await deleteProductImage(imageId);
      
      if (!success) throw error;
      
      // Update images state
      const updatedImages = images.filter(img => img.id !== imageId);
      setImages(updatedImages);
      
      // Trigger onChange callback
      if (onChange) {
        onChange(updatedImages);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(`Error deleting image: ${err.message}`);
    }
  };
  
  // Handle setting primary image
  const handleSetPrimary = async (imageId: string) => {
    try {
      setError(null);
      const { success, error } = await updateProductImageMetadata({
        imageId,
        isPrimary: true
      });
      
      if (!success) throw error;
      
      // Update images state
      const updatedImages = images.map(img => ({
        ...img,
        is_primary: img.id === imageId
      }));
      
      setImages(updatedImages);
      
      // Trigger onChange callback
      if (onChange) {
        onChange(updatedImages);
      }
    } catch (err) {
      console.error('Set primary error:', err);
      setError(`Error setting primary image: ${err.message}`);
    }
  };
  
  // Handle reordering images
  const handleReorder = async (imageId: string, newOrder: number) => {
    if (!allowReordering) return;
    
    try {
      setError(null);
      const { success, error } = await updateProductImageMetadata({
        imageId,
        displayOrder: newOrder
      });
      
      if (!success) throw error;
      
      // Update images state with new order
      const updatedImages = [...images];
      const imageIndex = updatedImages.findIndex(img => img.id === imageId);
      
      if (imageIndex >= 0) {
        updatedImages[imageIndex] = {
          ...updatedImages[imageIndex],
          display_order: newOrder
        };
        
        // Sort by display order
        updatedImages.sort((a, b) => a.display_order - b.display_order);
        
        setImages(updatedImages);
        
        // Trigger onChange callback
        if (onChange) {
          onChange(updatedImages);
        }
      }
    } catch (err) {
      console.error('Reorder error:', err);
      setError(`Error reordering image: ${err.message}`);
    }
  };
  
  // Handle drag and drop reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('imageIndex', index.toString());
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    const draggedIndex = parseInt(e.dataTransfer.getData('imageIndex'));
    if (draggedIndex === dropIndex) return;
    
    // Get the images being reordered
    const draggedImage = images[draggedIndex];
    const dropImage = images[dropIndex];
    
    // Switch their display orders
    handleReorder(draggedImage.id, dropImage.display_order);
    handleReorder(dropImage.id, draggedImage.display_order);
  };
  
  return (
    <div className="space-y-4">
      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* Upload progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">Uploading... {uploadProgress}%</p>
        </div>
      )}
      
      {/* Image grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Existing images */}
        {images.map((image, index) => (
          <div 
            key={image.id}
            className={`relative border rounded-md overflow-hidden ${image.is_primary ? 'ring-2 ring-primary' : ''}`}
            draggable={allowReordering}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <ResponsiveImage
              src={image.url}
              alt={image.alt_text || 'Product image'}
              aspectRatio={1}
              className="w-full"
            />
            
            {/* Image controls */}
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {/* Set as primary button */}
              {!image.is_primary && (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(image.id)}
                  className="p-2 bg-yellow-500 text-white rounded-full"
                  title="Set as primary image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              )}
              
              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleDelete(image.id)}
                className="p-2 bg-red-500 text-white rounded-full"
                title="Delete image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            
            {/* Primary badge */}
            {image.is_primary && (
              <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                Primary
              </div>
            )}
          </div>
        ))}
        
        {/* Upload button */}
        {images.length < maxImages && (
          <div className="border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center p-4">
            <label className="flex flex-col items-center justify-center cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="mt-2 text-sm text-gray-500">Upload Image</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={handleFileSelect}
                ref={fileInputRef}
                disabled={isUploading}
              />
            </label>
          </div>
        )}
      </div>
      
      {/* Helper text */}
      <p className="text-xs text-gray-500">
        {images.length} of {maxImages} images. {allowReordering && 'Drag images to reorder.'}
      </p>
    </div>
  );
}
