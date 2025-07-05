/**
 * API Caching Utilities
 * This file provides caching functionality for API endpoints
 */

import { NextApiRequest, NextApiResponse } from 'next';

// Cache storage
interface CacheItem<T> {
  data: T;
  expiry: number;
}

interface CacheOptions {
  /**
   * Cache duration in seconds
   * @default 60 (1 minute)
   */
  duration?: number;
  
  /**
   * Whether to cache based on query parameters
   * @default true
   */
  includeQuery?: boolean;
  
  /**
   * Tags for cache invalidation
   */
  tags?: string[];
}

// In-memory cache storage
const memoryCache: Record<string, CacheItem<any>> = {};

// Cache tag index for invalidation
const tagIndex: Record<string, string[]> = {};

/**
 * Generates a cache key from the request
 */
export function generateCacheKey(req: NextApiRequest, includeQuery: boolean = true): string {
  const path = req.url || '';
  
  if (!includeQuery) {
    // Only use the path part without query params
    return path.split('?')[0];
  }
  
  // Include sorted query params for consistent keys regardless of param order
  const query = req.query || {};
  const queryKeys = Object.keys(query).sort();
  
  if (queryKeys.length === 0) {
    return path;
  }
  
  const queryString = queryKeys
    .map(key => `${key}=${Array.isArray(query[key]) ? query[key].join(',') : query[key]}`)
    .join('&');
    
  return `${path.split('?')[0]}?${queryString}`;
}

/**
 * Wrapper for API handlers with caching
 */
export function withCache<T>(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<T>,
  options: CacheOptions = {}
) {
  const {
    duration = 60, // Default cache duration: 60 seconds
    includeQuery = true,
    tags = []
  } = options;
  
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      const data = await handler(req, res);
      res.status(200).json(data);
      return;
    }
    
    // Generate cache key
    const cacheKey = generateCacheKey(req, includeQuery);
    
    // Check if we have a valid cached response
    const cachedItem = memoryCache[cacheKey];
    if (cachedItem && cachedItem.expiry > Date.now()) {
      // Add cache status header
      res.setHeader('X-Cache', 'HIT');
      res.status(200).json(cachedItem.data);
      return;
    }
    
    // No cache hit, execute handler
    try {
      const data = await handler(req, res);
      
      // Cache the result
      const expiry = Date.now() + duration * 1000;
      memoryCache[cacheKey] = { data, expiry };
      
      // Add this cache key to the tag indices for invalidation
      tags.forEach(tag => {
        if (!tagIndex[tag]) {
          tagIndex[tag] = [];
        }
        if (!tagIndex[tag].includes(cacheKey)) {
          tagIndex[tag].push(cacheKey);
        }
      });
      
      // Set cache headers
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('Cache-Control', `private, max-age=${duration}`);
      
      res.status(200).json(data);
    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

/**
 * Invalidates all cache entries with specific tags
 */
export function invalidateCache(tags: string[]): void {
  tags.forEach(tag => {
    const keys = tagIndex[tag] || [];
    keys.forEach(key => {
      delete memoryCache[key];
    });
    // Clear the tag index
    tagIndex[tag] = [];
  });
}

/**
 * Clears the entire cache
 */
export function clearCache(): void {
  Object.keys(memoryCache).forEach(key => {
    delete memoryCache[key];
  });
  
  Object.keys(tagIndex).forEach(tag => {
    tagIndex[tag] = [];
  });
}
