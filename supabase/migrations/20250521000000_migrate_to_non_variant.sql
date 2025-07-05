-- Migration to revert from variant structure to non-variant structure

-- Step 1: Backup existing tables
CREATE TABLE IF NOT EXISTS product_skus_backup AS
  SELECT * FROM product_skus;

CREATE TABLE IF NOT EXISTS product_variants_backup AS
  SELECT * FROM product_variants;

-- Step 2: Add subsidy_percentage column to product_skus if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'product_skus' 
    AND column_name = 'subsidy_percentage'
  ) THEN
    ALTER TABLE public.product_skus ADD COLUMN subsidy_percentage NUMERIC DEFAULT 35;
  END IF;
END
$$;

-- Step 3: Update product_skus table with data from default variants
UPDATE product_skus ps
SET 
  capacity_kw = pv.capacity_kw,
  price = pv.price,
  subsidy_percentage = pv.subsidy_percentage,
  area_required = pv.area_required,
  monthly_savings = pv.monthly_savings,
  installation_time = pv.installation_days
FROM product_variants pv
WHERE ps.default_variant_id = pv.id;

-- Step 4: For products without a default_variant_id, use the first variant
UPDATE product_skus ps
SET 
  capacity_kw = pv.capacity_kw,
  price = pv.price,
  subsidy_percentage = pv.subsidy_percentage,
  area_required = pv.area_required,
  monthly_savings = pv.monthly_savings,
  installation_time = pv.installation_days
FROM product_variants pv
WHERE ps.id = pv.product_id
  AND ps.default_variant_id IS NULL
  AND pv.id IN (
    SELECT MIN(id) FROM product_variants
    WHERE product_id = ps.id
    GROUP BY product_id
  );

-- Step 5: Drop the foreign key constraint
ALTER TABLE product_skus
DROP CONSTRAINT IF EXISTS fk_product_skus_default_variant;

-- Step 6: Drop the default_variant_id column
ALTER TABLE product_skus
DROP COLUMN IF EXISTS default_variant_id;

-- Step 7: Create a view to maintain compatibility with code expecting variants
CREATE OR REPLACE VIEW product_variants_view AS
SELECT 
  id as id,
  id as product_id,
  capacity_kw,
  price,
  COALESCE(subsidy_percentage, 35) as subsidy_percentage,
  area_required,
  monthly_savings,
  installation_time as installation_days,
  true as is_default,
  created_at,
  updated_at
FROM product_skus;

-- Note: We're keeping the product_variants table for now
-- You can drop it later after ensuring the application works correctly
-- To drop the table, run: DROP TABLE public.product_variants CASCADE;
