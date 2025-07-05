/**
 * Security Logging Utilities
 * 
 * This module provides functions for logging security-related events
 * to the security_logs table in the database.
 */

import { supabase } from '../lib/supabaseClient';

// Types of security events
export enum SecurityEventType {
  ADMIN_ACCESS_ATTEMPT = 'admin_access_attempt',
  ADMIN_ACCESS_SUCCESS = 'admin_access_success',
  ADMIN_ACCESS_DENIED = 'admin_access_denied',
  AUTHENTICATION_FAILURE = 'authentication_failure',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  PERMISSION_CHANGE = 'permission_change',
  PASSWORD_RESET = 'password_reset',
  ACCOUNT_LOCKOUT = 'account_lockout',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded'
}

// Severity levels for security events
export enum SecurityEventSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Interface for security event details
export interface SecurityEventDetails {
  action?: string;
  resource?: string;
  outcome?: string;
  [key: string]: any; // Allow additional custom properties
}

/**
 * Log a security event to the database
 * 
 * @param eventType - Type of security event
 * @param details - Additional details about the event
 * @param severity - Severity level of the event
 * @returns Promise with the result of the logging operation
 */
export async function logSecurityEvent(
  eventType: SecurityEventType | string,
  details: SecurityEventDetails = {},
  severity: SecurityEventSeverity = SecurityEventSeverity.INFO
) {
  try {
    // Get current user info
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;

    if (!userId) {
      console.warn('Attempted to log security event without authenticated user');
      return { error: 'No authenticated user', success: false };
    }

    // Get client info
    const userAgent = navigator.userAgent;
    // IP will be captured server-side

    // Call the RPC function to log the event
    const { data: logId, error } = await supabase.rpc('log_security_event', {
      p_user_id: userId,
      p_event_type: eventType,
      p_user_agent: userAgent,
      p_details: details,
      p_severity: severity
    });

    if (error) {
      console.error('Error logging security event:', error);
      return { error, success: false };
    }

    return { logId, success: true };
  } catch (error) {
    console.error('Exception logging security event:', error);
    return { error, success: false };
  }
}

/**
 * Log an admin access attempt
 * 
 * @param success - Whether the access attempt was successful
 * @param details - Additional details about the attempt
 * @returns Promise with the result of the logging operation
 */
export async function logAdminAccessAttempt(success: boolean, details: SecurityEventDetails = {}) {
  const eventType = success 
    ? SecurityEventType.ADMIN_ACCESS_SUCCESS 
    : SecurityEventType.ADMIN_ACCESS_DENIED;
  
  const severity = success 
    ? SecurityEventSeverity.INFO 
    : SecurityEventSeverity.WARNING;
  
  return logSecurityEvent(eventType, details, severity);
}

/**
 * Log suspicious activity
 * 
 * @param details - Details about the suspicious activity
 * @param severity - Severity level of the event
 * @returns Promise with the result of the logging operation
 */
export async function logSuspiciousActivity(
  details: SecurityEventDetails,
  severity: SecurityEventSeverity = SecurityEventSeverity.WARNING
) {
  return logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, details, severity);
}
