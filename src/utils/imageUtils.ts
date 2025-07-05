import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabaseClient';

/**
 * Uploads an image to Supabase Storage and returns the public URL
 * @param file The file to upload
 * @param bucket The storage bucket to upload to
 * @param folder The folder within the bucket
 * @returns The public URL of the uploaded image or null if upload failed
 */
export async function uploadImage(
  file: File,
  bucket: string = 'productphotos',
  folder: string = 'variants'
): Promise<string | null> {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Generate a unique filename with original extension
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload the file to Supabase Storage
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    return null;
  }
}

/**
 * Remove image from Supabase Storage
 * @param url The public URL of the image to remove
 * @param bucket The storage bucket the image is in
 * @returns True if removal was successful, false otherwise
 */
export async function removeImage(
  url: string,
  bucket: string = 'productphotos'
): Promise<boolean> {
  try {
    if (!url) return false;
    
    // Extract the file path from the URL
    // URL format is like: https://xxx.supabase.co/storage/v1/object/public/products/variants/xxxx.jpg
    const urlParts = url.split(`/storage/v1/object/public/${bucket}/`);
    if (urlParts.length < 2) return false;
    
    const filePath = urlParts[1];
    
    // Remove the file from storage
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Error removing image:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in removeImage:', error);
    return false;
  }
}
