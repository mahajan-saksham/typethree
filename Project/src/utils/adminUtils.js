/**
 * Utility functions for admin operations
 * These can be run from the browser console when logged in as an admin
 */

import { supabase } from '../lib/supabaseClient';

/**
 * Upgrades the current user to superadmin role
 * Usage (from browser console): 
 * import('./utils/adminUtils.js').then(m => m.makeSuperAdmin())
 */
export async function makeSuperAdmin() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Error: You must be logged in to perform this action');
      return false;
    }
    
    // Get current role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
      
    if (profileError) throw profileError;
    
    if (profile?.role === 'superadmin') {
      console.log('User already has superadmin role');
      return true;
    }
    
    // Update to superadmin
    const { error } = await supabase
      .from('user_profiles')
      .update({ role: 'superadmin' })
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    console.log('%c✅ Success! Your role has been updated to superadmin.', 'color: green; font-weight: bold');
    console.log('Please log out and log back in for the changes to take effect.');
    return true;
  } catch (err) {
    console.error('❌ Error upgrading to superadmin:', err.message);
    return false;
  }
}

/**
 * Lists all admin users in the system
 * Usage (from browser console): 
 * import('./utils/adminUtils.js').then(m => m.listAdmins())
 */
export async function listAdmins() {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id, full_name, email, role, created_at')
      .in('role', ['admin', 'superadmin']);
      
    if (error) throw error;
    
    console.table(data);
    return data;
  } catch (err) {
    console.error('Error listing admins:', err.message);
    return [];
  }
}
