// Script to remove old SKU data from Supabase
import { createClient } from '@supabase/supabase-js';

// Use the same values as in src/lib/supabaseClient.ts
const supabaseUrl = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NzY1ODQsImV4cCI6MjA1OTI1MjU4NH0.seU-MjLZ3ze6b22InyZA-SCPg64fVPTC8Lnnnj0-Aps';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function removeOldSKUData() {
  console.log('Starting cleanup of old SKU data...');
  
  try {
    // 1. Check if we have products in the product_skus table
    console.log('Checking for products in the product_skus table...');
    const { data: products, error: productsError } = await supabase
      .from('product_skus')
      .select('count');
      
    if (productsError) {
      throw new Error(`Error checking products in product_skus: ${productsError.message}`);
    }
    
    if (!products || products.length === 0) {
      console.log('No products found in the product_skus table. Please check database connection.');
      return;
    }
    
    console.log(`Found ${products.length} products in the product_skus table.`);
    
    // 2. Get all old SKUs for reference
    console.log('Checking for old SKUs...');
    const { data: oldSkus, error: oldSkusError } = await supabase
      .from('product_skus')
      .select('count');
      
    if (oldSkusError) {
      throw new Error(`Error checking old SKUs: ${oldSkusError.message}`);
    }
    
    const skuCount = oldSkus && oldSkus.length > 0 ? oldSkus[0].count : 0;
    console.log(`Found ${skuCount} old SKUs to remove.`);
    
    // 3. Remove the old data
    if (skuCount > 0) {
      console.log('WARNING: This will permanently delete all data from the product_skus table.');
      console.log('Press Enter to continue or Ctrl+C to cancel...');
      await new Promise(resolve => {
        process.stdin.once('data', () => resolve());
      });
      
      console.log('Deleting old SKU data...');
      // Delete all rows with a filter that matches everything
      const { error: deleteError } = await supabase
        .from('product_skus')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // This matches all real UUIDs
        
      if (deleteError) {
        throw new Error(`Error deleting SKUs: ${deleteError.message}`);
      }
      
      console.log(`Successfully removed old SKUs.`);
    } else {
      console.log('No old SKUs found to remove.');
    }
    
    console.log('Cleanup completed successfully.');
    
  } catch (error) {
    console.error('Error removing old SKU data:', error.message);
  }
}

// Run the function
removeOldSKUData();
