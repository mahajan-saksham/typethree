/**
 * Admin Authentication Utilities
 * 
 * This module provides secure admin validation functions with server-side verification
 * and protection against client-side bypassing attempts.
 */

import { supabase } from '../lib/supabaseClient';

interface ValidationResponse {
  isAdmin: boolean;
  userId?: string;
  timestamp: number;
  validationId: string;
}

// Cache to store validation results
const validationCache = new Map<string, {
  result: boolean;
  timestamp: number;
  validationId: string;
}>();

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Validates admin rights using secure server-side validation
 * @returns Whether the current user has admin rights
 */
export async function validateAdminRights(): Promise<boolean> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Check cache first
    const cachedValidation = validationCache.get(user.id);
    const now = Date.now();
    
    if (
      cachedValidation && 
      (now - cachedValidation.timestamp < CACHE_DURATION)
    ) {
      return cachedValidation.result;
    }
    
    // Call secure server-side validation endpoint
    const response = await fetch('/api/auth/validate-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
      credentials: 'include', // Include cookies for session
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Admin validation error:', errorData);
      return false;
    }
    
    const validationResponse: ValidationResponse = await response.json();
    
    // Store in cache
    validationCache.set(user.id, {
      result: validationResponse.isAdmin,
      timestamp: now,
      validationId: validationResponse.validationId
    });
    
    return validationResponse.isAdmin;
  } catch (error) {
    console.error('Error during admin validation:', error);
    
    // Fallback to client-side validation if server-side fails
    return await clientSideFallbackValidation();
  }
}

/**
 * Fallback admin validation using direct Supabase call
 * This is less secure but provides a fallback if the server-side validation fails
 * @returns Whether the current user has admin rights
 */
async function clientSideFallbackValidation(): Promise<boolean> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Try the admin RPC function first
    try {
      const { data, error } = await supabase.rpc('is_admin', {
        user_id: user.id
      });
      
      if (error) throw error;
      return !!data;
    } catch (rpcError) {
      console.error('Fallback to direct query for admin check:', rpcError);
      
      // Final fallback to direct query
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return false;
      }
      
      return profile?.role === 'admin';
    }
  } catch (error) {
    console.error('Error in fallback admin validation:', error);
    return false;
  }
}

/**
 * Clears the admin validation cache
 * @param userId - Optional specific user ID to clear from cache
 */
export function clearValidationCache(userId?: string): void {
  if (userId) {
    validationCache.delete(userId);
  } else {
    validationCache.clear();
  }
}
