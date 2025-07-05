// Script to remove old product SKU data from the database
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory path for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with absolute path
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('Environment variables:', {
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
  hasKey: !!process.env.REACT_APP_SUPABASE_ANON_KEY
});

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  console.error('Make sure your .env file exists and contains REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeOldSKUData() {
  console.log('Starting removal of old SKU data...');
  
  try {
    // 1. Check if we have products in the product_skus table
    const { data: products, error: productsError } = await supabase
      .from('product_skus')
      .select('count');
      
    if (productsError) {
      throw new Error(`Error checking products: ${productsError.message}`);
    }
    
    if (!products || products.length === 0) {
      throw new Error('No products found in the product_skus table. Please verify database connection.');
    }
    
    console.log(`Found ${products.length} products in the product_skus table.`);
    
    // 2. Get all old SKUs for reference
    const { data: oldSkus, error: oldSkusError } = await supabase
      .from('product_skus')
      .select('*');
      
    if (oldSkusError) {
      throw new Error(`Error fetching old SKUs: ${oldSkusError.message}`);
    }
    
    console.log(`Found ${oldSkus?.length || 0} old SKUs to remove.`);
    
    // 3. Remove the old data
    if (oldSkus && oldSkus.length > 0) {
      // Ask for confirmation
      console.log('WARNING: This will permanently delete all data from the product_skus table.');
      console.log('Make sure you have already migrated the data to the new structure.');
      console.log('Press Ctrl+C now to cancel if you are not sure.');
      
      // Wait for 5 seconds to allow cancellation
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const { error: deleteError } = await supabase
        .from('product_skus')
        .delete()
        .neq('id', '-1'); // this ensures we're deleting all rows
        
      if (deleteError) {
        throw new Error(`Error deleting SKUs: ${deleteError.message}`);
      }
      
      console.log(`Successfully removed ${oldSkus.length} old SKUs.`);
    } else {
      console.log('No old SKUs found to remove.');
    }
    
    console.log('Operation completed successfully.');
    
  } catch (error) {
    console.error('Error removing old SKU data:', error.message);
  }
}

// Run the function
removeOldSKUData();
