-- Create a product_categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  icon_name VARCHAR(50) NOT NULL DEFAULT 'sun',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key reference to products table
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
ON CONFLICT (id) DO NOTHING;
