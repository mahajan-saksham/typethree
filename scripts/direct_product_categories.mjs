import { createClient } from '@supabase/supabase-js';

// Supabase connection details
const SUPABASE_URL = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY3NjU4NCwiZXhwIjoyMDU5MjUyNTg0fQ.3x2SBAJrCO1vpJhV4ATLGStcRLx1lOONuSqXY8vr6xk';

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Default product categories to insert
const defaultCategories = [
  { name: 'Solar Panels', icon_name: 'sun' },
  { name: 'Batteries', icon_name: 'battery-full' },
  { name: 'Inverters', icon_name: 'zap' },
  { name: 'Accessories', icon_name: 'plug' },
  { name: 'Mounting Systems', icon_name: 'layout' }
];

async function createProductCategoriesTable() {
  console.log('Creating product_categories table directly using Supabase client API...');

  try {
    // Check if table exists by trying to select from it
    const { error: checkError } = await supabase
      .from('product_categories')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.log('Table does not exist, creating it using raw SQL...');
      
      // Create the table using PostgreSQL's REST API
      const createTableResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            query: `
              CREATE TABLE IF NOT EXISTS product_categories (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL UNIQUE,
                icon_name VARCHAR(50) NOT NULL DEFAULT 'sun',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );
            `
          })
        }
      );
      
      const createResult = await createTableResponse.json();
      console.log('Table creation response:', createResult);
      
      // If we get here, attempt to insert default categories
      console.log('Inserting default categories...');
      
      // Insert default categories
      for (const category of defaultCategories) {
        const { data, error } = await supabase
          .from('product_categories')
          .insert(category)
          .select();
          
        if (error) {
          console.error(`Error inserting category ${category.name}:`, error);
        } else {
          console.log(`Successfully inserted category: ${category.name}`);
        }
      }
    } else if (checkError) {
      console.error('Error checking table:', checkError);
    } else {
      console.log('Table already exists, checking for categories...');
      
      // Check if there are any existing categories
      const { data: existingCategories, error: countError } = await supabase
        .from('product_categories')
        .select('*');
      
      if (countError) {
        console.error('Error checking existing categories:', countError);
        return;
      }
      
      if (!existingCategories || existingCategories.length === 0) {
        console.log('No categories found, inserting defaults...');
        
        // Insert default categories
        for (const category of defaultCategories) {
          const { data, error } = await supabase
            .from('product_categories')
            .insert(category)
            .select();
            
          if (error) {
            console.error(`Error inserting category ${category.name}:`, error);
          } else {
            console.log(`Successfully inserted category: ${category.name}`);
          }
        }
      } else {
        console.log(`Found ${existingCategories.length} existing categories:`);
        existingCategories.forEach(cat => console.log(`- ${cat.name}`));
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Execute the function
createProductCategoriesTable().then(() => {
  console.log('Product categories setup completed.');
});
