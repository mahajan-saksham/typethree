-- This is a placeholder migration file to match remote database history
-- It contains the product_categories table creation that was applied remotely

-- Create a product_categories table
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
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key reference to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id);

-- Create index on category_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
