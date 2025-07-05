-- Add category_id column to product_skus if it doesn't exist
ALTER TABLE product_skus
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_product_skus_category_id ON product_skus(category_id);

-- Grant permissions to authenticated and anon roles
GRANT SELECT ON product_categories TO authenticated, anon;
GRANT SELECT ON product_skus TO authenticated, anon;

-- Add RLS policy for products table if not exists
ALTER TABLE product_skus ENABLE ROW LEVEL SECURITY;

-- Anyone can view products
CREATE POLICY IF NOT EXISTS "Anyone can view products"
  ON product_skus
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admins can manage products
CREATE POLICY IF NOT EXISTS "Admins can manage products"
  ON product_skus
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_profiles WHERE role = 'admin'
    )
  );
