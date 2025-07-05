import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY3NjU4NCwiZXhwIjoyMDU5MjUyNTg0fQ.3x2SBAJrCO1vpJhV4ATLGStcRLx1lOONuSqXY8vr6xk';

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkCategories() {
  console.log('Checking product_categories table...');

  try {
    // Check if the product_categories table exists and get current categories
    const { data: categories, error: categoriesError } = await supabase
      .from('product_categories')
      .select('*');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return;
    }

    console.log('Found', categories?.length || 0, 'categories in the database');
    console.log('Categories:', categories);
    
    // Check if product_skus table has the category_id column
    const { data: productsWithCategory, error: productsError } = await supabase
      .rpc('check_column_exists', {
        p_table: 'product_skus',
        p_column: 'category_id'
      });
      
    if (productsError) {
      console.log('Could not check products table structure directly, let\'s try querying it...');
      
      // Try to query a product with category_id
      const { data: sampleProduct, error: sampleError } = await supabase
        .from('product_skus')
        .select('id, name, category_id')
        .limit(1);
      
      if (sampleError) {
        console.error('Error querying products table:', sampleError);
      } else {
        console.log('Sample product:', sampleProduct);
        console.log('Product_skus table appears to have category_id column:', sampleProduct[0] && 'category_id' in sampleProduct[0]);
      }
    } else {
      console.log('Products table has category_id column:', productsWithCategory);
    }
    
    // If no categories exist, insert the default ones
    if (!categories || categories.length === 0) {
      console.log('No categories found, inserting defaults...');
      
      const defaultCategories = [
        { name: 'All Products', icon_name: 'sun' },
        { name: 'On-Grid Systems', icon_name: 'sun' },
        { name: 'Off-Grid Systems', icon_name: 'zap' },
        { name: 'Hybrid Systems', icon_name: 'wrench' },
        { name: 'Residential', icon_name: 'home' },
        { name: 'Commercial', icon_name: 'building' },
        { name: 'Industrial', icon_name: 'factory' }
      ];
      
      const { data: insertedCategories, error: insertError } = await supabase
        .from('product_categories')
        .insert(defaultCategories)
        .select();
      
      if (insertError) {
        console.error('Error inserting default categories:', insertError);
      } else {
        console.log('Successfully inserted', insertedCategories.length, 'default categories');
      }
    }
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

// Run the function
checkCategories().then(() => {
  console.log('Done checking categories.');
  process.exit(0);
}).catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
