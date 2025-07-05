// Script to view current products
import { createClient } from '@supabase/supabase-js';

// Use the same connection details
const SUPABASE_URL = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY3NjU4NCwiZXhwIjoyMDU5MjUyNTg0fQ.3x2SBAJrCO1vpJhV4ATLGStcRLx1lOONuSqXY8vr6xk';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function viewProducts() {
  console.log('Fetching products...');
  
  // Get all products from both products and product_skus tables
  console.log('Checking products table:');
  const { data: products, error } = await supabase
    .from('products')
    .select('*');
    
  console.log('Checking product_skus table:');
  const { data: skus, error: skusError } = await supabase
    .from('product_skus')
    .select('*');
  
  if (error) {
    console.error('Error fetching products:', error.message);
    // Continue with SKUs even if products error out
  }
  
  if (skusError) {
    console.error('Error fetching product SKUs:', skusError.message);
    // Continue with products even if SKUs error out
  }
  
  console.log(`Found ${products?.length || 0} products in 'product_skus' table (first query).`);
  console.log(`Found ${skus?.length || 0} additional products in 'product_skus' table (second query).`);
  
  // Display products from the products table
  if (products && products.length > 0) {
    console.log('\nSample Products:');
    console.log('===============');
    
    products.slice(0, 3).forEach((product, index) => {
      console.log(`Product ${index + 1}:`);
      console.log(`ID: ${product.id}`);
      console.log(`Name: ${product.name}`);
      console.log(`SKU: ${product.sku}`);
      console.log(`Category: ${product.category || 'None'}`);
      console.log(`Category ID: ${product.category_id || 'None'}`);
      console.log('---------------------------');
    });
    
    if (products.length > 3) {
      console.log(`... and ${products.length - 3} more products`);
    }
  }
  
  // Display products from the product_skus table
  if (skus && skus.length > 0) {
    console.log('\nOther Products:');
    console.log('===============');
    
    skus.slice(0, 3).forEach((product, index) => {
      console.log(`Product SKU ${index + 1}:`);
      console.log(`ID: ${product.id}`);
      console.log(`Name: ${product.name}`);
      console.log(`SKU: ${product.sku}`);
      console.log(`Category: ${product.category || 'None'}`);
      console.log(`Category ID: ${product.category_id || 'None'}`);
      console.log('---------------------------');
    });
    
    if (skus.length > 3) {
      console.log(`... and ${skus.length - 3} more product SKUs`);
    }
  }
}

// Run the script
viewProducts().catch(err => {
  console.error('Unexpected error:', err);
});
