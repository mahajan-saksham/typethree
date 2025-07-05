// src/server/middleware.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../lib/supabaseClient';

/**
 * Type for the next handler function
 */
type NextHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

/**
 * Middleware to verify authentication
 */
export const withAuth = (handler: NextHandler) => async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    // Get the session from the request
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Attach user to request for downstream handlers
    (req as any).user = data.session.user;
    
    // Call the original handler
    return handler(req, res);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware to verify admin role
 */
export const withAdmin = (handler: NextHandler) => async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    // First check authentication
    const authHandler = withAuth(async (req, res) => {
      const user = (req as any).user;
      
      // Check if user has admin role
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (error || data?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin privileges required' });
      }
      
      // Call the original handler
      return handler(req, res);
    });
    
    // Execute the auth handler
    return authHandler(req, res);
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware to add rate limiting
 * @param limit Number of requests allowed in the time window
 * @param window Time window in seconds
 */
export const withRateLimit = (limit: number = 60, window: number = 60) => (
  handler: NextHandler
) => {
  // Simple in-memory store for rate limiting
  // In production, use Redis or similar
  const ipRequestCounts: Record<string, { count: number, resetTime: number }> = {};
  
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const ipStr = Array.isArray(ip) ? ip[0] : ip;
      const now = Date.now();
      
      // Initialize or reset counter if window has elapsed
      if (!ipRequestCounts[ipStr] || ipRequestCounts[ipStr].resetTime < now) {
        ipRequestCounts[ipStr] = {
          count: 1,
          resetTime: now + (window * 1000)
        };
      } else {
        // Increment counter
        ipRequestCounts[ipStr].count++;
        
        // Check if limit is exceeded
        if (ipRequestCounts[ipStr].count > limit) {
          return res.status(429).json({ 
            error: 'Too many requests',
            retryAfter: Math.ceil((ipRequestCounts[ipStr].resetTime - now) / 1000)
          });
        }
      }
      
      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', limit.toString());
      res.setHeader('X-RateLimit-Remaining', (limit - ipRequestCounts[ipStr].count).toString());
      res.setHeader('X-RateLimit-Reset', Math.ceil(ipRequestCounts[ipStr].resetTime / 1000).toString());
      
      // Call the original handler
      return handler(req, res);
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};
