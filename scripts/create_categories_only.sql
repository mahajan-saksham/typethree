-- Create a product_categories table only (skipping products table references for now)
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  icon_name VARCHAR(50) NOT NULL DEFAULT 'sun',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
