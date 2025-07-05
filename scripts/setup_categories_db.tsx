import React from 'react';
import { supabase } from '../src/lib/supabaseClient';

/**
 * Script to set up product categories table in Supabase
 * Run this script using: npx ts-node scripts/setup_categories_db.tsx
 */
async function setupCategoriesTable() {
  console.log('Starting database setup for product categories...');

  try {
    // 1. Create the product_categories table
    console.log('Creating product_categories table...');
    const { error: createTableError } = await supabase.rpc('exec', {
      query: `
        CREATE TABLE IF NOT EXISTS product_categories (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(100) NOT NULL,
          icon_name VARCHAR(50) NOT NULL DEFAULT 'sun',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (createTableError) {
      throw new Error(`Error creating table: ${createTableError.message}`);
    }
    console.log('Table created successfully!');

    // 2. Add category_id column to products table
    console.log('Adding category_id column to products table...');
    const { error: alterTableError } = await supabase.rpc('exec', {
      query: `
        ALTER TABLE products
        ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id);
      `
    });

    if (alterTableError) {
      throw new Error(`Error adding column: ${alterTableError.message}`);
    }
    console.log('Column added successfully!');

    // 3. Create index on category_id
    console.log('Creating index on category_id...');
    const { error: createIndexError } = await supabase.rpc('exec', {
      query: `
        CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
      `
    });

    if (createIndexError) {
      throw new Error(`Error creating index: ${createIndexError.message}`);
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
      throw new Error(`Error inserting categories: ${insertError.message}`);
    }
    console.log('Default categories inserted successfully!');

    console.log('Database setup completed successfully! 🎉');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    process.exit();
  }
}

// Run the setup function
setupCategoriesTable();
