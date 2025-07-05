import { supabase } from '../lib/supabaseClient';

/**
 * Utility to check which tables exist in the Supabase database
 * Helps diagnose form submission issues related to missing tables
 */
export async function checkDatabaseTables() {
  console.log('🔍 Checking available database tables...');
  
  // Tables we expect to find based on our application code
  const tablesToCheck = [
    'site_visits',
    'leads',
    'rooftop_leads',
    'product_skus',
    'consultations',
    'bookings',
    'users'
  ];
  
  const results: Record<string, boolean> = {};
  
  for (const tableName of tablesToCheck) {
    try {
      console.log(`Checking table: ${tableName}...`);
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        console.log(`✅ Table exists: ${tableName} (contains ${count} records)`);
        results[tableName] = true;
      } else {
        console.log(`❌ Table does not exist or not accessible: ${tableName}`);
        console.log(`   Error:`, error);
        results[tableName] = false;
      }
    } catch (e) {
      console.log(`❌ Error checking table ${tableName}:`, e);
      results[tableName] = false;
    }
  }
  
  // Also check for any other tables that might exist
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (!error && data) {
      console.log('📋 All tables in the database:');
      data.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    } else {
      console.log('❌ Could not query schema information, insufficient permissions');
    }
  } catch (e) {
    console.log('❌ Error querying schema information:', e);
  }
  
  return results;
}

/**
 * Creates a test lead or site visit to verify the tables are working
 */
export async function createTestRecord(tableName: string) {
  const testData = {
    name: 'Test User',
    customer_name: 'Test User',
    full_name: 'Test User',
    phone: '+919999999999',
    phone_number: '+919999999999',
    email: 'test@example.com',
    address: 'Test Address, India',
    city: 'Test City',
    state: 'Maharashtra',
    zip_code: '400001',
    pincode: '400001',
    preferred_date: new Date().toISOString().split('T')[0],
    preferred_time_slot: '10:00 AM - 12:00 PM',
    source: 'test',
    product_name: 'Test Product',
    status: 'test',
    created_at: new Date().toISOString()
  };
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .insert([testData])
      .select();
    
    if (error) {
      console.log(`❌ Failed to insert test record into ${tableName}:`, error);
      return { success: false, error };
    }
    
    console.log(`✅ Successfully inserted test record into ${tableName}:`, data);
    return { success: true, data };
  } catch (e) {
    console.log(`❌ Exception inserting test record into ${tableName}:`, e);
    return { success: false, error: e };
  }
}
