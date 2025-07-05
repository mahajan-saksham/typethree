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
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'product_skus' AND policyname = 'Anyone can view products'
  ) THEN
    CREATE POLICY "Anyone can view products"
      ON product_skus
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  -- Admins can manage products
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'product_skus' AND policyname = 'Admins can manage products'
  ) THEN
    CREATE POLICY "Admins can manage products"
      ON product_skus
      FOR ALL
      TO authenticated
      USING (
        auth.uid() IN (
          SELECT user_id FROM user_profiles WHERE role = 'admin'
        )
      );
  END IF;
END$$;