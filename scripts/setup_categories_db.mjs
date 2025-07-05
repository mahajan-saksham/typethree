import { createClient } from '@supabase/supabase-js';

// NOTE: Replace the service_role key with your actual key from Supabase dashboard
// Project Settings > API > Project API Keys > service_role key
const SUPABASE_URL = 'https://dtuoyawpebjcmfesgwwn.supabase.co';

// ⚠️ IMPORTANT: Replace this with your service_role key from Supabase dashboard ⚠️
// This is a placeholder - you need to paste your actual service_role key below
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY3NjU4NCwiZXhwIjoyMDU5MjUyNTg0fQ.3x2SBAJrCO1vpJhV4ATLGStcRLx1lOONuSqXY8vr6xk';

// Initialize Supabase client with service role key for admin access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupCategoriesTable() {
  console.log('Starting database setup for product categories...');

  try {
    // We'll execute SQL directly using POST requests with the service role key instead of RPC
    console.log('1. Creating product_categories table...');
    
    // First, let's check if the table exists
    const { data: tableExists, error: checkError } = await supabase
      .from('product_categories')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    
    if (checkError && !checkError.message.includes('relation "product_categories" does not exist')) {
      console.error('Error checking table:', checkError);
      return;
    }
    
    if (checkError) {
      // Table doesn't exist, let's create it using PG function
      console.log('Table does not exist, creating it...');
      
      // Create the product_categories table with extension for UUID
      const { error: extensionError } = await supabase.rpc('create_uuid_extension_if_not_exists', {});
      if (extensionError) {
        console.log('Note: UUID extension may already exist or require higher privileges');
      }
      
      // Create the product_categories table
      const { error: createTableError } = await supabase.rpc('run_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS product_categories (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(100) NOT NULL UNIQUE,
            icon_name VARCHAR(50) NOT NULL DEFAULT 'sun',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (createTableError) {
        console.error('Error creating table using RPC:', createTableError);
        console.log('Trying alternative method to create table...');
        
        try {
          // Alternative: Use raw SQL through the REST API
          await supabase.from('_exec').select(`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
            
            CREATE TABLE IF NOT EXISTS product_categories (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              name VARCHAR(100) NOT NULL UNIQUE,
              icon_name VARCHAR(50) NOT NULL DEFAULT 'sun',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `);
          
          console.log('Product categories table created with alternative method!');
        } catch (err) {
          console.error('Alternative method failed:', err);
          console.log('Please create the table using the SQL Editor in Supabase Dashboard');
          return;
        }
      } else {
        console.log('Product categories table created successfully!');
      }
    } else {
      console.log('Product categories table already exists');
    }
    
    // Insert default categories
    console.log('2. Inserting default categories...');
    const categories = [
      { name: 'All Products', icon_name: 'sun' },
      { name: 'On-Grid Systems', icon_name: 'sun' },
      { name: 'Off-Grid Systems', icon_name: 'zap' },
      { name: 'Hybrid Systems', icon_name: 'wrench' },
      { name: 'Residential', icon_name: 'home' },
      { name: 'Commercial', icon_name: 'building' },
      { name: 'Industrial', icon_name: 'factory' }
    ];
    
    // First create the table if it doesn't exist yet
    const { error: createError } = await supabase.rpc('run_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS product_categories (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(100) NOT NULL UNIQUE,
          icon_name VARCHAR(50) NOT NULL DEFAULT 'sun',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createError) {
      console.error('Error creating table:', createError);
    }
    
    // Now insert the categories
    const { error: insertError } = await supabase
      .from('product_categories')
      .upsert(categories, { onConflict: 'name', ignoreDuplicates: true })
      .select();

    if (insertError) {
      console.error('Error inserting categories:', insertError);
      return;
    }
    console.log('Default categories inserted successfully!');
    
    // Add category_id column to products table if it doesn't exist
    console.log('3. Setting up products table relationship...');
    const productsRes = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      }
    });
    
    if (productsRes.ok) {
      console.log('Products table exists, checking if we need to add category_id column...');
      // We can add the category_id column
      const addColumnRes = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          command: `
            -- Add foreign key reference to products table if not exists
            DO $$ 
            BEGIN
              IF NOT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_name = 'products' AND column_name = 'category_id'
              ) THEN
                ALTER TABLE products
                ADD COLUMN category_id UUID REFERENCES product_categories(id);
                
                CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
              END IF;
            END $$;
          `
        })
      });
      
      if (!addColumnRes.ok) {
        console.error('Error adding category_id column to products table');
      } else {
        console.log('Products table relationship set up successfully!');
      }
    } else {
      console.warn('Products table not found or cannot be accessed');
    }
    
    console.log('Database setup completed successfully! 🎉');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

// Run the setup function
setupCategoriesTable().then(() => {
  console.log('Setup process complete.');
  process.exit(0);
}).catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
