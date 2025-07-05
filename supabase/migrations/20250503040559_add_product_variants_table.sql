-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES product_skus(id) ON DELETE CASCADE,
  capacity_kw NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  subsidy_percentage NUMERIC NOT NULL DEFAULT 35,
  area_required NUMERIC NOT NULL,
  monthly_savings NUMERIC NOT NULL,
  installation_days TEXT NOT NULL DEFAULT '4-5',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on product_id for better performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

-- Create unique constraint to ensure only one default variant per product
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_default_unique
  ON product_variants (product_id)
  WHERE is_default = true;

-- Set up RLS policies
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$ 
BEGIN
  -- Anyone can view product variants
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'product_variants' AND policyname = 'Anyone can view product variants'
  ) THEN
    CREATE POLICY "Anyone can view product variants"
      ON product_variants
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  -- Only admins can modify product variants
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'product_variants' AND policyname = 'Admins can manage product variants'
  ) THEN
    CREATE POLICY "Admins can manage product variants"
      ON product_variants
      FOR ALL
      TO authenticated
      USING (
        auth.uid() IN (
          SELECT user_id FROM user_profiles WHERE role = 'admin'
        )
      );
  END IF;
END$$;