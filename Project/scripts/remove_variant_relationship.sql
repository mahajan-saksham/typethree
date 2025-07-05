-- Remove variant relationship from product_skus table

-- Step 1: Drop the foreign key constraint
ALTER TABLE product_skus
DROP CONSTRAINT IF EXISTS fk_product_skus_default_variant;

-- Step 2: Drop the default_variant_id column
ALTER TABLE product_skus
DROP COLUMN IF EXISTS default_variant_id;

-- Note: Keep the product_variants table for now
-- You can drop it later after ensuring the application works correctly
-- To drop the table, run: DROP TABLE public.product_variants CASCADE;
