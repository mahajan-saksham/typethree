// One-time script to update a user's role to superadmin
// Run this with: node src/scripts/makeSuperAdmin.js

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  console.error('Error: Supabase key is required. Set REACT_APP_SUPABASE_ANON_KEY environment variable.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Get the currently logged in user or specified user ID
async function makeSuperAdmin() {
  try {
    // Get current user from auth session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw sessionError;
    }
    
    if (!session) {
      console.error('Error: No active session found. Please log in first.');
      process.exit(1);
    }
    
    const userId = session.user.id;
    console.log(`Updating user ${userId} to superadmin role...`);
    
    // Update the user_profiles table
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ role: 'superadmin' })
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Success! User role updated to superadmin.');
    console.log('Please log out and log back in for the changes to take effect.');
    
  } catch (error) {
    console.error('❌ Error updating user role:', error.message);
    process.exit(1);
  }
}

makeSuperAdmin();
