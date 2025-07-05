-- SQL script to remove old product SKU data
-- WARNING: This will DELETE all data from the product_skus table
-- Make sure you have migrated your data to the new structure first

-- First, check if we have data in the new products table
SELECT COUNT(*) FROM products;

-- If the count above shows records, then you can run the following DELETE statement
-- DELETE FROM product_skus;

-- IMPORTANT: Uncomment the line above only after verifying you have data in the new products table
