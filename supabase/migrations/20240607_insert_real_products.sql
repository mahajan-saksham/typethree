-- Insert product data from Type3Solar catalog
-- First, ensure we have product categories
INSERT INTO product_categories (name, icon_name, description) VALUES
  ('Solar Panels', 'solar-panel', 'On-grid, off-grid, and hybrid solar systems'),
  ('Water Heaters', 'droplets', 'Solar-powered water heating solutions'),
  ('Street Lights', 'lightbulb', 'Solar street and decorative lighting'),
  ('Water Pumps', 'waves', 'Solar-powered water pumping systems'),
  ('Electric Fences', 'shield-check', 'Solar electric fencing for security')
ON CONFLICT (name) DO NOTHING;

-- Insert products with real data and images
INSERT INTO product_skus (
  id, name, capacity_kw, price, sale_price, monthly_savings, 
  subsidy_amount, warranty_years, installation_time, 
  description, image_url, product_category_id
) VALUES
  -- On-Grid Systems
  ('ONGRID-1KW-001', '1KW On-Grid Solar System', 1, 89000, 69000, 1500, 
   20000, 25, '3-4 days', 
   'Complete 1kW on-grid solar power system with high-efficiency panels, 1kW inverter, mounting structure, and 25-year performance warranty.',
   'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/Off-grid%20solar%20system/1kW%20off-grid%20solar%20system.png',
   (SELECT id FROM product_categories WHERE name = 'Solar Panels')),
   
  ('ONGRID-2KW-001', '2KW On-Grid Solar System', 2, 139000, 99000, 3000, 
   40000, 25, '3-4 days', 
   'Complete 2kW on-grid solar power system with high-efficiency panels, 2kW inverter, mounting structure, and 25-year performance warranty.',
   'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/Off-grid%20solar%20system/2kW%20off-grid%20solar%20system.png',
   (SELECT id FROM product_categories WHERE name = 'Solar Panels')),
   
  ('ONGRID-3KW-001', '3KW On-Grid Solar System', 3, 205000, 127000, 4500, 
   78000, 25, '3-4 days', 
   'Complete 3kW on-grid solar power system with high-efficiency panels, 3kW inverter, mounting structure, and 25-year performance warranty.',
   'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/Off-grid%20solar%20system/3kW%20off-grid%20solar%20system.png',
   (SELECT id FROM product_categories WHERE name = 'Solar Panels')),
   
  ('ONGRID-5KW-001', '5KW On-Grid Solar System', 5, 325000, 225000, 7500, 
   100000, 25, '4-5 days', 
   'Complete 5kW on-grid solar power system with high-efficiency panels, 5kW inverter, mounting structure, and 25-year performance warranty.',
   'https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/productphotos/Off-grid%20solar%20system/5kW%20off-grid%20solar%20system.png',
   (SELECT id FROM product_categories WHERE name = 'Solar Panels')),