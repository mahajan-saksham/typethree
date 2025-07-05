/**
 * Image Storage Management
 * Utilities for uploading, managing, and optimizing product images
 */

import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { ProductImage } from '@/types/product';
import { v4 as uuidv4 } from 'uuid';

// Define image size variants
export const IMAGE_SIZES = {
  thumbnail: { width: 200, height: 200 },
  small: { width: 400, height: 400 },
  medium: { width: 800, height: 800 },
  large: { width: 1200, height: 1200 },
  original: { width: null, height: null }
};

export type ImageSize = keyof typeof IMAGE_SIZES;

/**
 * Supabase storage bucket for product images
 */
export const PRODUCT_IMAGES_BUCKET = 'product-images';

/**
 * Initializes the storage buckets needed for product images
 * Should be run once during setup
 */
export async function initializeImageStorage() {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === PRODUCT_IMAGES_BUCKET);
    
    if (!bucketExists) {
      // Create bucket if it doesn't exist
      const { error } = await supabaseAdmin.storage.createBucket(PRODUCT_IMAGES_BUCKET, {
        public: true, // Make the bucket public
        fileSizeLimit: 5 * 1024 * 1024, // 5MB limit
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      });
      
      if (error) throw error;
      
      console.log(`Created ${PRODUCT_IMAGES_BUCKET} bucket`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing image storage:', error);
    return { success: false, error };
  }
}

/**
 * Uploads an image to Supabase Storage
 */
export async function uploadProductImage({
  productId,
  file,
  altText = '',
  isPrimary = false,
  displayOrder = 0,
  onProgress
}: {
  productId: string;
  file: File;
  altText?: string;
  isPrimary?: boolean;
  displayOrder?: number;
  onProgress?: (progress: number) => void;
}): Promise<{ data: ProductImage | null; error: any }> {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      throw new Error('File size must be less than 5MB');
    }
    
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${productId}/${fileName}`;
    
    // Upload file to storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .getPublicUrl(filePath);
    
    // Create database record
    const imageRecord: Omit<ProductImage, 'id' | 'created_at' | 'updated_at'> = {
      product_id: productId,
      url: publicUrl,
      alt_text: altText,
      is_primary: isPrimary,
      display_order: displayOrder
    };
    
    // If this is the primary image, update other images to not be primary
    if (isPrimary) {
      await supabaseAdmin
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId);
    }
    
    // Insert the image record
    const { data, error: dbError } = await supabaseAdmin
      .from('product_images')
      .insert(imageRecord)
      .select()
      .single();
      
    if (dbError) throw dbError;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error uploading product image:', error);
    return { data: null, error };
  }
}

/**
 * Deletes a product image from storage and database
 */
export async function deleteProductImage(imageId: string): Promise<{ success: boolean; error: any }> {
  try {
    // Get the image record first to find the storage path
    const { data: image, error: fetchError } = await supabase
      .from('product_images')
      .select('*')
      .eq('id', imageId)
      .single();
      
    if (fetchError) throw fetchError;
    
    if (!image) {
      throw new Error('Image not found');
    }
    
    // Extract file path from URL
    const url = new URL(image.url);
    const pathWithBucket = url.pathname;
    
    // Path is usually in format: /storage/v1/object/public/bucket-name/path
    // We need just the path part
    const parts = pathWithBucket.split('/');
    const bucketIndex = parts.indexOf('public') + 1;
    const path = parts.slice(bucketIndex + 1).join('/');
    
    // Delete from storage
    const { error: storageError } = await supabaseAdmin.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .remove([path]);
      
    if (storageError) throw storageError;
    
    // Delete from database
    const { error: dbError } = await supabaseAdmin
      .from('product_images')
      .delete()
      .eq('id', imageId);
      
    if (dbError) throw dbError;
    
    // Check if image was primary
    if (image.is_primary) {
      // Set the first remaining image as primary
      const { data: images } = await supabase
        .from('product_images')
        .select('id')
        .eq('product_id', image.product_id)
        .order('display_order')
        .limit(1);
        
      if (images && images.length > 0) {
        await supabaseAdmin
          .from('product_images')
          .update({ is_primary: true })
          .eq('id', images[0].id);
      }
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting product image:', error);
    return { success: false, error };
  }
}

/**
 * Updates image metadata (alt text, is_primary, display_order)
 */
export async function updateProductImageMetadata({
  imageId,
  altText,
  isPrimary,
  displayOrder
}: {
  imageId: string;
  altText?: string;
  isPrimary?: boolean;
  displayOrder?: number;
}): Promise<{ success: boolean; error: any }> {
  try {
    // Get the current image data
    const { data: image, error: fetchError } = await supabase
      .from('product_images')
      .select('product_id, is_primary')
      .eq('id', imageId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // If changing to primary and it's not already primary
    if (isPrimary && !image.is_primary) {
      // Update other images to not be primary
      await supabaseAdmin
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', image.product_id);
    }
    
    // Update the image metadata
    const updates: any = {};
    if (altText !== undefined) updates.alt_text = altText;
    if (isPrimary !== undefined) updates.is_primary = isPrimary;
    if (displayOrder !== undefined) updates.display_order = displayOrder;
    
    const { error: updateError } = await supabaseAdmin
      .from('product_images')
      .update(updates)
      .eq('id', imageId);
      
    if (updateError) throw updateError;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating product image metadata:', error);
    return { success: false, error };
  }
}

/**
 * Gets the optimized image URL for a specific size
 */
export function getOptimizedImageUrl(url: string, size: ImageSize = 'medium'): string {
  // Parse the URL to add transformation parameters
  try {
    const parsedUrl = new URL(url);
    const imageSize = IMAGE_SIZES[size];
    
    // If this is already a Supabase Storage URL, modify it to add transformations
    if (parsedUrl.pathname.includes('/storage/v1/object/public/')) {
      const path = parsedUrl.pathname;
      const transformPath = path.replace('/storage/v1/object/public/', '/storage/v1/transform/public/');
      
      // Add transformation parameters
      let transformOptions = '';
      if (imageSize.width && imageSize.height) {
        transformOptions = `resize=width:${imageSize.width},height:${imageSize.height}`;
      }
      
      // Return the transformed URL
      return `${parsedUrl.origin}${transformPath}?${transformOptions}`;
    }
    
    // For non-Supabase URLs, return original
    return url;
  } catch (error) {
    console.error('Error parsing image URL:', error);
    return url;
  }
}

/**
 * Gets the image dimensions based on size
 */
export function getImageDimensions(size: ImageSize): { width: number | null; height: number | null } {
  return IMAGE_SIZES[size];
}
