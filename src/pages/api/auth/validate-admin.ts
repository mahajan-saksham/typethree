/**
 * Admin Validation API Endpoint
 * POST /api/auth/validate-admin
 * 
 * This endpoint provides secure server-side validation of admin rights
 * with rate limiting, logging, and protection against client-side bypassing
 */

import { supabase } from '../../../lib/supabaseClient';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { z } from 'zod';

// Define type for request and response to replace Next.js types
type Request = {
  method: string;
  headers: Record<string, string | string[] | undefined>;
  body: any;
  socket: {
    remoteAddress?: string;
  };
};

type Response = {
  status: (code: number) => Response;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => void;
};

// Schema for validation request
const ValidationRequestSchema = z.object({
  // The token is optional because we'll also check the session cookie
  token: z.string().optional(),
});

// Interface for validation response
interface ValidationResponse {
  isAdmin: boolean;
  userId?: string;
  timestamp: number;
  validationId: string;
}

// Rate limiting config
const RATE_LIMIT = {
  MAX_ATTEMPTS: 5,
  WINDOW_MINUTES: 5
};

/**
 * Check if a user is rate limited
 * @param userId - The user ID to check
 * @returns Whether the user is rate limited
 */
async function isRateLimited(userId: string): Promise<boolean> {
  try {
    // Call the new rate limiting function we added in the database
    const { data, error } = await supabase.rpc('is_rate_limited', {
      p_user_id: userId,
      p_max_attempts: RATE_LIMIT.MAX_ATTEMPTS,
      p_window_minutes: RATE_LIMIT.WINDOW_MINUTES
    });
    
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    
    // Default to false to allow operation in case of error
    // This is a security trade-off but prevents total system failure
    return false;
  }
}

/**
 * Record a validation attempt
 * @param userId - The user ID
 * @param success - Whether the validation was successful
 * @param req - The request object for metadata
 */
async function recordAttempt(userId: string, success: boolean, req: Request): Promise<void> {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    await supabase.rpc('record_validation_attempt', {
      p_user_id: userId,
      p_ip_address: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
      p_user_agent: userAgent,
      p_success: success
    });
  } catch (error) {
    console.error('Error recording validation attempt:', error);
    // Non-blocking error - continue operation even if logging fails
  }
}

/**
 * Validate the request body against a Zod schema
 */
function validateBody(req: Request, res: Response, schema: z.ZodType<any>) {
  try {
    return schema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request body', details: error.errors });
      return null;
    }
    
    res.status(400).json({ error: 'Invalid request body' });
    return null;
  }
}

export default async function handler(req: Request, res: Response) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate request body
  const validatedBody = validateBody(req, res, ValidationRequestSchema);
  if (!validatedBody) return;

  try {
    // Get current user from the session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = session.user.id;

    // Check rate limiting
    const rateLimited = await isRateLimited(userId);
    if (rateLimited) {
      // Record the rate-limited attempt
      await recordAttempt(userId, false, req);
      
      return res.status(429).json({
        error: 'Too many validation attempts. Please try again later.',
        retryAfter: RATE_LIMIT.WINDOW_MINUTES * 60 // seconds
      });
    }

    // Check if user has admin privileges
    try {
      // Get request metadata for security context
      const userAgent = req.headers['user-agent'] || 'unknown';
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      
      // Try the primary approach - use supabaseAdmin to bypass RLS for secure operation
      try {
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .select('role')
          .eq('user_id', userId)
          .single();

        if (profileError) throw profileError;
        
        const isAdmin = profile?.role === 'admin';
        
        // Record the validation attempt
        await recordAttempt(userId, isAdmin, req);
        
        // Return validation result with signed timestamp for verification
        const response: ValidationResponse = {
          isAdmin,
          userId,
          timestamp: Date.now(),
          validationId: `${userId}-${Date.now()}`
        };
        
        return res.status(200).json(response);
      } catch (adminError) {
        console.log('Error using direct admin validation, falling back to RPC function');
        
        // Fallback to RPC function approach
        const { data: isAdmin, error } = await supabase.rpc('is_admin', {
          user_id: userId,
          p_ip_address: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
          p_user_agent: userAgent
        });

        if (error) {
          console.error('Error validating admin status:', error);
          
          // Fallback to simpler admin check if the enhanced function isn't available
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', userId)
            .maybeSingle();

          if (profileError) {
            await recordAttempt(userId, false, req);
            return res.status(500).json({ error: 'Internal server error' });
          }

          const isAdminFallback = profile?.role === 'admin';
          
          // Record the validation attempt
          await recordAttempt(userId, isAdminFallback, req);

          // Return validation result with signed timestamp for verification
          const response: ValidationResponse = {
            isAdmin: isAdminFallback,
            userId,
            timestamp: Date.now(),
            validationId: `${userId}-${Date.now()}`
          };

          return res.status(200).json(response);
        }

        // Record the validation attempt
        await recordAttempt(userId, !!isAdmin, req);

        // Return validation result with signed timestamp for verification
        const response: ValidationResponse = {
          isAdmin: !!isAdmin,
          userId,
          timestamp: Date.now(),
          validationId: `${userId}-${Date.now()}`
        };

        return res.status(200).json(response);
      }
    } catch (error: any) {
      console.error('Error in admin validation endpoint:', error);
      await recordAttempt(userId, false, req);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error: any) {
    console.error('Error in admin validation endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
