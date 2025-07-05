-- Enable Row Level Security on product_categories table
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for product_categories using DO block to check if they already exist
DO $$ 
BEGIN
  -- Allow anonymous users to read all categories
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'product_categories' AND policyname = 'Anyone can view product categories'
  ) THEN
    CREATE POLICY "Anyone can view product categories"
      ON product_categories
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  -- Allow authenticated admin users to manage categories
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'product_categories' AND policyname = 'Admins can manage product categories'
  ) THEN
    CREATE POLICY "Admins can manage product categories"
      ON product_categories
      FOR ALL
      TO authenticated
      USING (
        auth.uid() IN (
          SELECT user_id FROM user_profiles WHERE role = 'admin'
        )
      );
  END IF;
END$$;
