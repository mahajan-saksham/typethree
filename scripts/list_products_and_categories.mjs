import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY3NjU4NCwiZXhwIjoyMDU5MjUyNTg0fQ.3x2SBAJrCO1vpJhV4ATLGStcRLx1lOONuSqXY8vr6xk';

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function listProductsAndCategories() {
  console.log('Fetching product categories...');
  
  // Get all categories
  const { data: categories, error: catError } = await supabase
    .from('product_categories')
    .select('*')
    .order('name');
  
  if (catError) {
    console.error('Error fetching categories:', catError.message);
    return;
  }
  
  console.log(`Found ${categories.length} categories:`);
  categories.forEach(cat => {
    console.log(`- ${cat.name} (ID: ${cat.id})`);
  });
  
  console.log('\nFetching product SKUs...');
  
  // Get all products
  const { data: products, error: prodError } = await supabase
    .from('product_skus')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (prodError) {
    console.error('Error fetching products:', prodError.message);
    return;
  }
  
  console.log(`Found ${products.length} products:`);
  products.forEach(product => {
    console.log(`- ${product.name} (ID: ${product.id}, Category: ${product.category || 'None'}, Category ID: ${product.category_id || 'None'})`);
  });
}

// Run the script
listProductsAndCategories().catch(err => {
  console.error('Unexpected error:', err);
});
