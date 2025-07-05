-- Check product_categories table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM 
  information_schema.columns
WHERE 
  table_schema = 'public' AND 
  table_name = 'product_categories'
ORDER BY 
  ordinal_position;

-- Check if we have any existing categories
SELECT * FROM product_categories LIMIT 10;
