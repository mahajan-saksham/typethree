const { createClient } = require('@supabase/supabase-js');

// Get Supabase URL and key from environment or hardcode them here
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dtuoyawpebjcmfesgwwn.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dW95YXdwZWJqY21mZXNnd3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODMxMTI0MTMsImV4cCI6MTk5ODY4ODQxM30.YQfoUXJqXt_GjRpIBRZ64EIX-CLguV6K_PFkHppbjQY';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupCategoriesTable() {
  console.log('Starting database setup for product categories...');

  try {
    // 1. Create the product_categories table
    console.log('Creating product_categories table...');
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS product_categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        icon_name VARCHAR(50) NOT NULL DEFAULT 'sun',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // Run the SQL query
    const { error: createTableError } = await supabase.rpc('exec', {
      query: createTableQuery
    });

    if (createTableError) {
      console.error('Error creating table:', createTableError);
      return;
    }
    console.log('Table created successfully!');

    // 2. Add category_id column to products table
    console.log('Adding category_id column to products table...');
    const alterTableQuery = `
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id);
    `;
    
    const { error: alterTableError } = await supabase.rpc('exec', {
      query: alterTableQuery
    });

    if (alterTableError) {
      console.error('Error adding column:', alterTableError);
      return;
    }
    console.log('Column added successfully!');

    // 3. Create index on category_id
    console.log('Creating index on category_id...');
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
    `;
    
    const { error: createIndexError } = await supabase.rpc('exec', {
      query: createIndexQuery
    });

    if (createIndexError) {
      console.error('Error creating index:', createIndexError);
      return;
    }
    console.log('Index created successfully!');

    // 4. Insert default categories
    console.log('Inserting default categories...');
    const { error: insertError } = await supabase
      .from('product_categories')
      .insert([
        { name: 'All Products', icon_name: 'sun' },
        { name: 'On-Grid Systems', icon_name: 'sun' },
        { name: 'Off-Grid Systems', icon_name: 'zap' },
        { name: 'Hybrid Systems', icon_name: 'wrench' },
        { name: 'Residential', icon_name: 'home' },
        { name: 'Commercial', icon_name: 'building' },
        { name: 'Industrial', icon_name: 'factory' }
      ])
      .select();

    if (insertError) {
      console.error('Error inserting categories:', insertError);
      return;
    }
    console.log('Default categories inserted successfully!');

    console.log('Database setup completed successfully! 🎉');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

// Run the setup function
setupCategoriesTable().then(() => {
  console.log('Setup process complete.');
  process.exit();
}).catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
