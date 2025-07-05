/**
 * CDN Configuration
 * Utilities for configuring CDN settings for optimized image delivery
 */

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { PRODUCT_IMAGES_BUCKET } from './storage';

/**
 * Configures CDN settings for the product images bucket
 */
export async function configureCDNSettings() {
  try {
    // Update bucket configuration
    const { error } = await supabaseAdmin.storage.updateBucket(PRODUCT_IMAGES_BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    });

    if (error) throw error;

    // Get the CDN URL for the bucket
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .getPublicUrl('');

    // Return configuration
    return {
      success: true,
      cdnUrl: publicUrl,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxSize: '5MB'
    };
  } catch (error) {
    console.error('Error configuring CDN settings:', error);
    return { success: false, error };
  }
}

/**
 * Gets the recommended HTML headers for optimized image delivery
 * Use these headers with your reverse proxy or CDN configuration
 */
export function getRecommendedHeaders() {
  return {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Content-Type': 'image/webp', // For WebP images
    'Vary': 'Accept',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Max-Age': '86400', // 24 hours
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'self'",
    'Accept-Encoding': 'br, gzip',
  };
}

/**
 * Get Vercel Image Optimization configuration example
 * Use these settings in your vercel.json file
 */
export function getVercelImageConfig() {
  return {
    images: {
      domains: ['dtuoyawpebjcmfesgwwn.supabase.co'], // Replace with your Supabase project domain
      formats: ['image/webp'],
      minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
      deviceSizes: [640, 750, 828, 1080, 1200, 1920],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    }
  };
}

/**
 * Get Cloudflare configuration example
 * Use these settings with Cloudflare Workers or Page Rules
 */
export function getCloudflareConfig() {
  return {
    pageRules: [
      {
        url: '*supabase.co/storage/v1/object/public/product-images/*',
        settings: {
          'Browser Cache TTL': '30 days',
          'Edge Cache TTL': '30 days',
          'Cache Level': 'Cache Everything',
          'Origin Cache Control': 'on',
          'Polish': 'lossy',
          'Mirage': 'on',
          'Rocket Loader': 'off'
        }
      }
    ],
    workerScript: `
      addEventListener('fetch', event => {
        event.respondWith(handleRequest(event.request))
      })
      
      async function handleRequest(request) {
        // Get the response from the origin
        let response = await fetch(request)
        
        // Clone the response so we can modify it
        let newResponse = new Response(response.body, response)
        
        // Set cache headers
        newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
        newResponse.headers.set('Vary', 'Accept')
        
        // If it's an image, apply optimizations
        if (response.headers.get('content-type')?.includes('image/')) {
          // Additional headers for images
          newResponse.headers.set('Access-Control-Allow-Origin', '*')
        }
        
        return newResponse
      }
    `
  };
}
