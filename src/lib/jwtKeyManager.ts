/**
 * JWT Key Manager
 * 
 * This module provides utilities for JWT key rotation and validation
 * in a secure manner to enhance authentication security.
 */

import { supabase } from './supabaseClient';
import { supabaseAdmin } from './supabaseAdmin';

/**
 * Interface for JWT key information
 */
export interface JwtKeyInfo {
  keyId: string;
  needsRotation: boolean;
  daysUntilRotation: number;
}

/**
 * Interface for JWT key event
 */
export interface JwtKeyEvent {
  id: string;
  eventType: string;
  keyId: string;
  performedBy: string | null;
  clientIp: string | null;
  userAgent: string | null;
  createdAt: string;
}

/**
 * Check if JWT keys need rotation
 * @returns Promise with array of key information
 */
export async function checkJwtKeyRotation(): Promise<JwtKeyInfo[]> {
  try {
    const { data, error } = await supabaseAdmin.rpc('check_jwt_key_rotation');
    
    if (error) {
      console.error('Error checking JWT key rotation:', error);
      throw error;
    }
    
    return data.map((key: any) => ({
      keyId: key.key_id,
      needsRotation: key.needs_rotation,
      daysUntilRotation: key.days_until_rotation
    }));
  } catch (err) {
    console.error('Failed to check JWT key rotation:', err);
    throw err;
  }
}

/**
 * Rotate a specific JWT key
 * @param keyId The ID of the key to rotate
 * @returns Promise with boolean success indicator
 */
export async function rotateJwtKey(keyId: string): Promise<boolean> {
  try {
    // Capture client information for security logs
    const clientInfo = {
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : null
    };
    
    const { data, error } = await supabaseAdmin
      .rpc('rotate_jwt_key', { 
        p_key_id: keyId,
        client_info: clientInfo
      });
    
    if (error) {
      console.error('Error rotating JWT key:', error);
      throw error;
    }
    
    // Force token refresh to use the new key
    await refreshAuthToken();
    
    return data;
  } catch (err) {
    console.error('Failed to rotate JWT key:', err);
    throw err;
  }
}

/**
 * Get JWT key events (for admin monitoring)
 * @param limit Maximum number of events to return
 * @returns Promise with array of key events
 */
export async function getJwtKeyEvents(limit = 50): Promise<JwtKeyEvent[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('jwt_key_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching JWT key events:', error);
      throw error;
    }
    
    return data.map((event: any) => ({
      id: event.id,
      eventType: event.event_type,
      keyId: event.key_id,
      performedBy: event.performed_by,
      clientIp: event.client_ip,
      userAgent: event.user_agent,
      createdAt: event.created_at
    }));
  } catch (err) {
    console.error('Failed to fetch JWT key events:', err);
    throw err;
  }
}

/**
 * Add a new JWT key
 * @param keyId Unique identifier for the key
 * @param algorithm Signing algorithm (default: HS256)
 * @param rotationFrequency How often the key should be rotated (default: 30 days)
 * @param makeCurrent Whether to make this the current active key
 * @returns Promise with the new key ID
 */
export async function addJwtKey(
  keyId: string,
  algorithm = 'HS256',
  rotationFrequency = '30 days',
  makeCurrent = false
): Promise<string> {
  try {
    const { data, error } = await supabaseAdmin.rpc('add_jwt_key', {
      p_key_id: keyId,
      p_algorithm: algorithm,
      p_rotation_frequency: rotationFrequency,
      p_make_current: makeCurrent
    });
    
    if (error) {
      console.error('Error adding JWT key:', error);
      throw error;
    }
    
    // If making this the current key, refresh tokens
    if (makeCurrent) {
      await refreshAuthToken();
    }
    
    return data;
  } catch (err) {
    console.error('Failed to add JWT key:', err);
    throw err;
  }
}

/**
 * Force refresh of the authentication token
 * This ensures the client gets a new token signed with the current key
 */
export async function refreshAuthToken(): Promise<void> {
  try {
    const { error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Error refreshing auth token:', error);
      throw error;
    }
  } catch (err) {
    console.error('Failed to refresh auth token:', err);
    throw err;
  }
}

/**
 * Initialize the JWT key system
 * This should be called during application startup to ensure keys exist
 */
export async function initializeJwtKeys(): Promise<void> {
  try {
    // Check if any keys exist and need rotation
    const keys = await checkJwtKeyRotation();
    
    if (keys.length === 0) {
      // No keys exist, create initial key
      await addJwtKey(
        `primary-${new Date().toISOString().split('T')[0].replace(/-/g, '')}`,
        'HS256',
        '30 days',
        true
      );
    } else {
      // Check if any keys need rotation
      const keyNeedingRotation = keys.find(key => key.needsRotation);
      
      if (keyNeedingRotation) {
        console.log(`JWT key ${keyNeedingRotation.keyId} needs rotation`);
        // In production, you might want to auto-rotate or notify admins
      }
    }
  } catch (err) {
    console.error('Failed to initialize JWT keys:', err);
    // Non-blocking error - don't throw, just log
  }
}

/**
 * Schedule periodic JWT key rotation checks
 * @param intervalMinutes How often to check (default: 720 minutes = 12 hours)
 */
export function scheduleKeyRotationChecks(intervalMinutes = 720): NodeJS.Timeout {
  // Initial check
  initializeJwtKeys();
  
  // Schedule regular checks
  return setInterval(() => {
    checkJwtKeyRotation()
      .then(keys => {
        const keysNeedingRotation = keys.filter(key => key.needsRotation);
        
        if (keysNeedingRotation.length > 0) {
          console.log(`${keysNeedingRotation.length} JWT keys need rotation`);
          // In production, you might want to auto-rotate or notify admins
        }
      })
      .catch(err => console.error('Scheduled JWT key rotation check failed:', err));
  }, intervalMinutes * 60 * 1000);
}
