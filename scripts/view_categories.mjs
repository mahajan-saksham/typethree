// Script to view current product categories
import { createClient } from '@supabase/supabase-js';

// Use the same connection details from update_product_categories.mjs
const SUPABASE_URL = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY3NjU4NCwiZXhwIjoyMDU5MjUyNTg0fQ.3x2SBAJrCO1vpJhV4ATLGStcRLx1lOONuSqXY8vr6xk';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function viewCategories() {
  console.log('Fetching product categories...');
  
  // Get all categories
  const { data: categories, error } = await supabase
    .from('product_categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching categories:', error.message);
    return;
  }
  
  console.log('Current Product Categories:');
  console.log('===========================');
  
  // Display categories with their IDs for easy reference
  categories.forEach(category => {
    console.log(`ID: ${category.id}`);
    console.log(`Name: ${category.name}`);
    console.log(`Icon: ${category.icon_name || 'None'}`);
    console.log('---------------------------');
  });
  
  console.log(`\nTotal categories: ${categories.length}`);
}

// Run the script
viewCategories().catch(err => {
  console.error('Unexpected error:', err);
});
