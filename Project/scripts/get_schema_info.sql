-- Get all tables in the public schema
SELECT 
  table_name 
FROM 
  information_schema.tables 
WHERE 
  table_schema = 'public' 
ORDER BY 
  table_name;

-- Get all tables that contain 'product' in their name
SELECT 
  table_name 
FROM 
  information_schema.tables 
WHERE 
  table_schema = 'public' AND
  table_name LIKE '%product%'
ORDER BY 
  table_name;
