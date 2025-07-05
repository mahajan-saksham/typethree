/**
 * Enhanced Admin Guard Hook
 * 
 * This hook provides secure admin validation with improved security features:
 * - Client-side caching to reduce database queries
 * - Proper loading, error, and success states
 * - Enhanced security by using the new improved is_admin function
 * - Backward compatibility with existing code
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { validateAdminRights, clearValidationCache } from '../utils/adminAuth';

interface AdminGuardState {
  isAdmin: boolean | null;
  isLoading: boolean;
  error: string | null;
  lastChecked: number | null;
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// In-memory cache for admin status
const adminStatusCache = new Map<string, AdminGuardState>();

/**
 * Hook for validating admin status with enhanced security
 */
export function useAdminGuard() {
  const [state, setState] = useState<AdminGuardState>({
    isAdmin: null,
    isLoading: true,
    error: null,
    lastChecked: null
  });

  // Function to validate admin status
  const validateAdminStatus = useCallback(async (userId: string) => {
    try {
      // Check cache first
      const cachedState = adminStatusCache.get(userId);
      const now = Date.now();
      
      if (
        cachedState && 
        cachedState.lastChecked && 
        (now - cachedState.lastChecked < CACHE_DURATION) &&
        cachedState.isAdmin !== null
      ) {
        setState(cachedState);
        return cachedState.isAdmin;
      }
      
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Use the new secure server-side validation with fallback mechanism
      try {
        // Try the enhanced server-side validation first
        const isAdmin = await validateAdminRights();
        
        const newState: AdminGuardState = {
          isAdmin,
          isLoading: false,
          error: null,
          lastChecked: now
        };
        
        setState(newState);
        adminStatusCache.set(userId, newState);
        
        return isAdmin;
      } catch (serverError) {
        console.log('Server-side validation failed, falling back to direct validation');
        
        // Fall back to the original is_admin function for backward compatibility
        const { data, error } = await supabase.rpc('is_admin', {
          user_id: userId
        });
        
        if (error) throw error;
        
        const newState: AdminGuardState = {
          isAdmin: !!data,
          isLoading: false,
          error: null,
          lastChecked: now
        };
        
        setState(newState);
        adminStatusCache.set(userId, newState);
        
        return !!data;
      }
    } catch (error: any) {
      console.error('Error validating admin status:', error);
      
      const newState: AdminGuardState = {
        isAdmin: false, // Default to not admin on error for security
        isLoading: false,
        error: error.message || 'Error validating admin permissions',
        lastChecked: Date.now()
      };
      
      setState(newState);
      adminStatusCache.set(userId, newState);
      
      return false;
    }
  }, []);

  // Function to check current user's admin status
  const checkCurrentUserAdminStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        const newState: AdminGuardState = {
          isAdmin: false,
          isLoading: false,
          error: 'User not authenticated',
          lastChecked: Date.now()
        };
        
        setState(newState);
        return false;
      }
      
      return await validateAdminStatus(user.id);
    } catch (error: any) {
      console.error('Error checking current user:', error);
      
      const newState: AdminGuardState = {
        isAdmin: false,
        isLoading: false,
        error: error.message || 'Error checking authentication status',
        lastChecked: Date.now()
      };
      
      setState(newState);
      return false;
    }
  }, [validateAdminStatus]);

  // Clear the admin status cache
  const clearCache = useCallback((userId?: string) => {
    // Clear local hook cache
    if (userId) {
      adminStatusCache.delete(userId);
    } else {
      adminStatusCache.clear();
    }
    
    // Also clear the global validation cache
    clearValidationCache(userId);
  }, []);

  // Perform the admin check on mount
  useEffect(() => {
    checkCurrentUserAdminStatus();
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      // Clear cache and recheck on auth state change
      clearCache();
      checkCurrentUserAdminStatus();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [checkCurrentUserAdminStatus, clearCache]);

  return {
    isAdmin: state.isAdmin,
    isLoading: state.isLoading,
    error: state.error,
    validateAdminStatus,
    checkCurrentUserAdminStatus,
    clearCache
  };
}
