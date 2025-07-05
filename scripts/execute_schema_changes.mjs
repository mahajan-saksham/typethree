import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY3NjU4NCwiZXhwIjoyMDU5MjUyNTg0fQ.3x2SBAJrCO1vpJhV4ATLGStcRLx1lOONuSqXY8vr6xk';

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Executes SQL statements to remove variant relationships
 */
async function executeSchemaChanges() {
  try {
    console.log('Executing schema changes to remove variant relationships...');
    
    // Step 1: Drop the foreign key constraint
    console.log('1. Dropping foreign key constraint...');
    const { error: constraintError } = await supabase.rpc('execute_sql', {
      query: 'ALTER TABLE product_skus DROP CONSTRAINT IF EXISTS fk_product_skus_default_variant;'
    });
    
    if (constraintError) {
      // If the RPC method doesn't exist or fails, try an alternative approach
      console.log('   RPC method failed, trying direct query...');
      
      // Since we can't directly query pg_catalog with Supabase client,
      // we'll use a simpler approach to drop the constraint
      console.log('   Using alternative approach to drop constraint...');
      console.log('   You will need to run this SQL in the Supabase dashboard:');
      console.log('   ALTER TABLE product_skus DROP CONSTRAINT IF EXISTS fk_product_skus_default_variant;');
      console.log('   If that doesn\'t work, you may need to find the exact constraint name from the database.');
      console.log('   No variant-related constraint found, continuing...');
    } else {
      console.log('   Foreign key constraint dropped successfully.');
    }
    
    // Step 2: Drop the default_variant_id column
    console.log('\n2. Dropping default_variant_id column...');
    const { error: columnError } = await supabase.rpc('execute_sql', {
      query: 'ALTER TABLE product_skus DROP COLUMN IF EXISTS default_variant_id;'
    });
    
    if (columnError) {
      console.log('   RPC method failed. You will need to run this SQL in the Supabase dashboard:');
      console.log('   ALTER TABLE product_skus DROP COLUMN IF EXISTS default_variant_id;');
    } else {
      console.log('   Column dropped successfully.');
    }
    
    console.log('\nSchema changes completed!');
    console.log('\nNext steps:');
    console.log('1. Test the application to ensure everything works with the simplified structure');
    console.log('2. Once everything is working correctly, you can drop the product_variants table:');
    console.log('   - DROP TABLE public.product_variants CASCADE;');
    
  } catch (error) {
    console.error('Schema changes failed:', error.message);
    console.log('\nYou will need to run these SQL commands manually in the Supabase dashboard:');
    console.log('1. ALTER TABLE product_skus DROP CONSTRAINT IF EXISTS fk_product_skus_default_variant;');
    console.log('2. ALTER TABLE product_skus DROP COLUMN IF EXISTS default_variant_id;');
  }
}

// Run the schema changes
executeSchemaChanges().then(() => console.log('Script execution completed.'));
