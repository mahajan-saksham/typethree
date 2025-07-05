-- SQL Verification Tests for Product Schema
-- Use this script to verify the product schema is working correctly

-- 1. Verify tables exist
SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_categories') AS product_categories_exists;
SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_skus') AS product_skus_exists;
SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_variants') AS product_variants_exists;
SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'product_images') AS product_images_exists;

-- 2. Verify default variant trigger works
-- Set a different variant as default and verify others are set to false
BEGIN;
-- First, check current default state
SELECT product_id, id, capacity_kw, is_default 
FROM product_variants 
WHERE product_id = (SELECT id FROM product_skus WHERE slug = 'solarprime-residential')
ORDER BY capacity_kw;

-- Now change the default
UPDATE product_variants 
SET is_default = true 
WHERE product_id = (SELECT id FROM product_skus WHERE slug = 'solarprime-residential')
  AND capacity_kw = 1;

-- Verify only one is default
SELECT product_id, id, capacity_kw, is_default 
FROM product_variants 
WHERE product_id = (SELECT id FROM product_skus WHERE slug = 'solarprime-residential')
ORDER BY capacity_kw;
ROLLBACK;

-- 3. Verify subsidized_price calculation
SELECT 
  name, 
  capacity_kw, 
  price, 
  subsidy_percentage, 
  subsidized_price,
  ROUND(price * (1 - subsidy_percentage / 100), 2) AS manual_calculation,
  subsidized_price = ROUND(price * (1 - subsidy_percentage / 100), 2) AS calculation_correct
FROM product_variants
LIMIT 10;

-- 4. Test product query with default variant
SELECT 
  p.name,
  p.slug,
  p.category_id,
  c.name AS category_name,
  v.capacity_kw,
  v.price,
  v.subsidized_price,
  i.url AS primary_image_url
FROM product_skus p
JOIN product_categories c ON p.category_id = c.id
JOIN product_variants v ON v.product_id = p.id AND v.is_default = true
LEFT JOIN product_images i ON i.product_id = p.id AND i.is_primary = true
WHERE p.is_active = true
ORDER BY p.name;

-- 5. Test variant uniqueness constraint (capacity_kw must be unique per product)
-- This should fail:
DO $$
BEGIN
  BEGIN
    INSERT INTO product_variants (
      product_id,
      name,
      capacity_kw,
      price,
      subsidy_percentage,
      area_required_sqft,
      monthly_savings,
      installation_days,
      is_default,
      inventory_count
    ) VALUES (
      (SELECT id FROM product_skus WHERE slug = 'solarprime-residential'),
      '2kW Duplicate', -- Note name can be different
      2, -- This capacity already exists for this product
      180000,
      40,
      160,
      2400,
      '2-3',
      false,
      5
    );
    RAISE NOTICE 'Uniqueness constraint test failed - duplicate inserted';
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE 'Uniqueness constraint test passed - duplicate rejected';
  END;
END;
$$;
