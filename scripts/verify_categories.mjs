import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY3NjU4NCwiZXhwIjoyMDU5MjUyNTg0fQ.3x2SBAJrCO1vpJhV4ATLGStcRLx1lOONuSqXY8vr6xk';

// Initialize Supabase client with anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkProductCategoriesTable() {
  console.log('Checking product_categories table...');

  try {
    // Attempt to select all categories
    const { data: categories, error } = await supabase
      .from('product_categories')
      .select('*');
    
    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }
    
    if (categories && categories.length > 0) {
      console.log(`✅ Success! Found ${categories.length} categories:`);
      categories.forEach(category => {
        console.log(`- ${category.name} (icon: ${category.icon_name})`);
      });
    } else {
      console.log('❌ No categories found in the table.');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Execute the check
checkProductCategoriesTable().then(() => {
  console.log('Verification completed.');
});
