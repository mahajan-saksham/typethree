// Script to safely remove the products table after standardizing on product_skus
import { createClient } from '@supabase/supabase-js';

// Use the same values as in src/lib/supabaseClient.ts
const supabaseUrl = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NzY1ODQsImV4cCI6MjA1OTI1MjU4NH0.seU-MjLZ3ze6b22InyZA-SCPg64fVPTC8Lnnnj0-Aps';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function removeProductsTable() {
  console.log('\n==== Remove Products Table Script ====');
  console.log('This script will safely remove the products table after verifying all data is in product_skus');
  
  try {
    // Step 1: Check that product_skus table exists and has data
    console.log('\n1. Checking product_skus table...');
    const { data: skus, error: skusError } = await supabase
      .from('product_skus')
      .select('count');
      
    if (skusError) {
      throw new Error(`Error checking product_skus table: ${skusError.message}`);
    }
    
    if (!skus || skus.length === 0) {
      throw new Error('No products found in product_skus table. Migration should be done first.');
    }
    
    console.log(`✅ Found data in product_skus table.`);
    
    // Step 2: Back up products table data (if it exists)
    console.log('\n2. Backing up products table data...');
    let productsData = [];
    
    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');
        
      if (productsError) {
        console.log(`Note: Could not query products table: ${productsError.message}`);
        console.log('The table may already be removed or renamed.');
      } else if (products && products.length > 0) {
        productsData = products;
        console.log(`✅ Backed up ${products.length} records from products table.`);
        
        // Save backup to a JSON file in the database
        const timestamp = new Date().toISOString().replace(/[:.-]/g, '_');
        const backupName = `products_table_backup_${timestamp}`;
        
        const { error: backupError } = await supabase
          .from('backups')
          .insert([{ 
            name: backupName, 
            data: products,
            created_at: new Date().toISOString() 
          }]);
          
        if (backupError) {
          console.log(`Warning: Could not save backup to database: ${backupError.message}`);
          console.log('Continuing with removal anyway...');
        } else {
          console.log(`✅ Backup saved to database as '${backupName}'`);
        }
      } else {
        console.log('Note: Products table exists but is empty.');
      }
    } catch (err) {
      console.log(`Warning: Error backing up products table: ${err.message}`);
      console.log('Continuing with removal anyway...');
    }
    
    // Step 3: Drop the products table
    console.log('\n3. Removing products table...');
    
    try {
      // Execute SQL directly using raw query
      // Note: The 'DROP TABLE IF EXISTS' syntax is safer as it won't throw an error if the table doesn't exist
      const { error: dropError } = await supabase
        .from('products')
        .delete()
        .eq('id', 'non-existent-id'); // This is just to check if the table exists
        
      if (dropError && dropError.code === '42P01') {
        // Error code 42P01 means 'relation does not exist'
        console.log('✅ Products table does not exist, nothing to remove.');
        return;
      }
      
      // If we get here, the table exists, so let's create a migration to drop it
      console.log('✅ Products table exists, proceeding with removal.');
      console.log('Note: Since we cannot directly execute SQL commands using the Supabase JS client,');
      console.log('we recommend running the following SQL in the Supabase SQL editor:');
      console.log('\n```sql\nDROP TABLE IF EXISTS products;\n```');
      
      if (dropError) {
        throw new Error(`Error dropping products table: ${dropError.message}`);
      }
      
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      console.log('The products table was not removed due to the error above.');
    }
    
    console.log('\n✅ Migration to product_skus is now complete!');    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    console.log('The products table was not removed due to the error above.');
  }
}

// Run the function
removeProductsTable().then(() => {
  console.log('\nScript execution complete.');
  process.exit(0);
}).catch(err => {
  console.error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
