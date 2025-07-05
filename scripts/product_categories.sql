-- Create the product_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  icon_name VARCHAR(50) NOT NULL DEFAULT 'sun',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table if it doesn't exist yet (for reference)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Insert default categories if they don't exist already
INSERT INTO product_categories (name, icon_name)
VALUES 
  ('Solar Panels', 'sun'),
  ('Batteries', 'battery-full'),
  ('Inverters', 'zap'),
  ('Accessories', 'plug'),
  ('Mounting Systems', 'layout')
ON CONFLICT (name) DO NOTHING;
