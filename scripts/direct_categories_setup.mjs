import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY3NjU4NCwiZXhwIjoyMDU5MjUyNTg0fQ.3x2SBAJrCO1vpJhV4ATLGStcRLx1lOONuSqXY8vr6xk';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function setupProductCategoriesTable() {
  try {
    console.log('Starting setup for product_categories table...');
    
    // Directly execute SQL using the REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY
      },
      body: JSON.stringify({
        query: `
          -- Create extension for UUID if it doesn't exist
          CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
          
          -- Create product_categories table if it doesn't exist
          CREATE TABLE IF NOT EXISTS product_categories (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(100) NOT NULL UNIQUE,
            icon_name VARCHAR(50) NOT NULL DEFAULT 'sun',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Create products table if it doesn't exist yet
          CREATE TABLE IF NOT EXISTS products (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            sku VARCHAR(100),
            description TEXT,
            price DECIMAL(10, 2),
            capacity_kw DECIMAL(10, 2),
            inventory_count INTEGER DEFAULT 0,
            generation INTEGER,
            roof_area_required_sqft DECIMAL(10, 2),
            panel_type VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Add foreign key reference to products table
          ALTER TABLE products
            ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id);
          
          -- Create index on category_id for faster lookups
          CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
        `
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create tables: ${JSON.stringify(error)}`);
    }
    
    console.log('Tables created successfully!');
    
    // Try inserting default categories
    console.log('Inserting default categories...');
    
    const categories = [
      { name: 'All Products', icon_name: 'sun' },
      { name: 'On-Grid Systems', icon_name: 'sun' },
      { name: 'Off-Grid Systems', icon_name: 'zap' },
      { name: 'Hybrid Systems', icon_name: 'wrench' },
      { name: 'Residential', icon_name: 'home' },
      { name: 'Commercial', icon_name: 'building' },
      { name: 'Industrial', icon_name: 'factory' }
    ];
    
    // Insert categories using the Supabase client
    const { error: insertError } = await supabase
      .from('product_categories')
      .upsert(categories, { onConflict: 'name', ignoreDuplicates: true });
      
    if (insertError) {
      console.error('Error inserting categories:', insertError);
    } else {
      console.log('Categories inserted successfully!');
    }
    
    // Verify categories were inserted
    const { data: existingCategories, error: fetchError } = await supabase
      .from('product_categories')
      .select('*');
      
    if (fetchError) {
      console.error('Error fetching categories:', fetchError);
    } else {
      console.log(`Found ${existingCategories.length} categories in the database:`);
      console.log(existingCategories);
    }
    
    console.log('Setup completed! Your admin interface should now work correctly.');
  } catch (error) {
    console.error('Error setting up product categories:', error);
  }
}

// Run the setup function
setupProductCategoriesTable().catch(console.error).finally(() => process.exit());
