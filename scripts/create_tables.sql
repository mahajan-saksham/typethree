-- First, create the product_categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  icon_name VARCHAR(50) NOT NULL DEFAULT 'sun',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check if the products table exists, if not create it
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

-- Now that we know products exists, add the category_id column
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id);

-- Create index on category_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Insert some default categories
INSERT INTO product_categories (name, icon_name) VALUES
  ('All Products', 'sun'),
  ('On-Grid Systems', 'sun'),
  ('Off-Grid Systems', 'zap'),
  ('Hybrid Systems', 'wrench'),
  ('Residential', 'home'),
  ('Commercial', 'building'),
  ('Industrial', 'factory')
ON CONFLICT (name) DO NOTHING;
