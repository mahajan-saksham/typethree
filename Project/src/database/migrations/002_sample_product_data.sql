-- Sample Product Data Insertion
-- Description: Inserts realistic product data into the new schema

BEGIN;

-- Residential Products
INSERT INTO public.product_skus (
  name, 
  slug, 
  sku, 
  category_id,
  description,
  short_description,
  features,
  specifications,
  use_cases,
  has_subsidy,
  has_variants
) VALUES (
  'SolarPrime Residential System',
  'solarprime-residential',
  'SP-RES-2023',
  (SELECT id FROM public.product_categories WHERE slug = 'residential'),
  'The SolarPrime Residential System is our flagship solar solution for homes, featuring high-efficiency monocrystalline panels, advanced inverter technology, and optional battery storage. This system is designed to maximize energy production while minimizing roof space requirements, making it ideal for urban and suburban homes. With our integrated monitoring system, you can track energy production and consumption in real-time from your smartphone or computer.',
  'High-efficiency residential solar system with advanced monitoring and optional battery storage.',
  '{
    "highlights": [
      "High-efficiency monocrystalline panels",
      "Smart inverter with power optimization",
      "Real-time monitoring via smartphone app",
      "25-year performance warranty",
      "Premium aluminum mounting system",
      "Optional battery storage integration"
    ]
  }'::jsonb,
  '{
    "panel_type": "Monocrystalline PERC",
    "panel_efficiency": "22.8%",
    "inverter_type": "Hybrid Grid-Tied",
    "warranty": "25 years performance, 10 years product",
    "certifications": ["IEC 61215", "IEC 61730", "BIS Approved"],
    "monitoring": "Integrated Wi-Fi monitoring system"
  }'::jsonb,
  ARRAY['Residential'],
  true,
  true
);

-- Insert variants for SolarPrime Residential
INSERT INTO public.product_variants (
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
) VALUES
  (
    (SELECT id FROM public.product_skus WHERE slug = 'solarprime-residential'),
    '1kW',
    1,
    85000,
    40,
    80,
    1200,
    '1-2',
    false,
    12
  ),
  (
    (SELECT id FROM public.product_skus WHERE slug = 'solarprime-residential'),
    '2kW',
    2,
    165000,
    40,
    160,
    2400,
    '2-3',
    true,
    10
  ),
  (
    (SELECT id FROM public.product_skus WHERE slug = 'solarprime-residential'),
    '3kW',
    3,
    240000,
    40,
    240,
    3600,
    '2-3',
    false,
    8
  ),
  (
    (SELECT id FROM public.product_skus WHERE slug = 'solarprime-residential'),
    '5kW',
    5,
    395000,
    40,
    400,
    6000,
    '3-4',
    false,
    5
  );

-- Insert images for SolarPrime Residential
INSERT INTO public.product_images (
  product_id,
  url,
  alt_text,
  is_primary,
  display_order
) VALUES
  (
    (SELECT id FROM public.product_skus WHERE slug = 'solarprime-residential'),
    'https://images.unsplash.com/photo-1611365892117-e342cf14e6f6?w=800',
    'SolarPrime Residential System installed on a modern home',
    true,
    1
  ),
  (
    (SELECT id FROM public.product_skus WHERE slug = 'solarprime-residential'),
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
    'Close-up of SolarPrime solar panel installation',
    false,
    2
  ),
  (
    (SELECT id FROM public.product_skus WHERE slug = 'solarprime-residential'),
    'https://images.unsplash.com/photo-1611365892108-d00047661f08?w=800',
    'SolarPrime monitoring system dashboard',
    false,
    3
  );

-- Commercial Product
INSERT INTO public.product_skus (
  name, 
  slug, 
  sku, 
  category_id,
  description,
  short_description,
  features,
  specifications,
  use_cases,
  has_subsidy,
  has_variants
) VALUES (
  'CommercialSolar Pro Series',
  'commercial-solar-pro',
  'CS-PRO-2023',
  (SELECT id FROM public.product_categories WHERE slug = 'commercial'),
  'The CommercialSolar Pro Series is designed specifically for businesses looking to reduce operational costs and achieve sustainability goals. This system features high-durability panels optimized for commercial rooftops, with scalable capacity to meet various energy demands. The included advanced monitoring system allows for detailed analytics on energy production, usage patterns, and ROI tracking.',
  'Premium commercial solar solution with scalable capacity and advanced analytics.',
  '{
    "highlights": [
      "Industrial-grade solar panels with enhanced durability",
      "Advanced three-phase inverter system",
      "Scalable design for future expansion",
      "Business analytics dashboard for ROI tracking",
      "Commercial-grade mounting system with wind resistance",
      "Optional EV charging station integration"
    ]
  }'::jsonb,
  '{
    "panel_type": "Bifacial Monocrystalline",
    "panel_efficiency": "21.5%",
    "inverter_type": "Three-phase Grid-Tied",
    "warranty": "25 years performance, 12 years product",
    "certifications": ["IEC 61215", "IEC 61730", "IEC 62941", "BIS Approved"],
    "monitoring": "Commercial-grade monitoring with API access"
  }'::jsonb,
  ARRAY['Commercial'],
  true,
  true
);

-- Insert variants for CommercialSolar Pro
INSERT INTO public.product_variants (
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
) VALUES
  (
    (SELECT id FROM public.product_skus WHERE slug = 'commercial-solar-pro'),
    '10kW',
    10,
    750000,
    30,
    850,
    12000,
    '5-7',
    false,
    4
  ),
  (
    (SELECT id FROM public.product_skus WHERE slug = 'commercial-solar-pro'),
    '25kW',
    25,
    1800000,
    30,
    2100,
    30000,
    '10-14',
    true,
    3
  ),
  (
    (SELECT id FROM public.product_skus WHERE slug = 'commercial-solar-pro'),
    '50kW',
    50,
    3500000,
    30,
    4200,
    60000,
    '14-21',
    false,
    2
  );

-- Insert images for CommercialSolar Pro
INSERT INTO public.product_images (
  product_id,
  url,
  alt_text,
  is_primary,
  display_order
) VALUES
  (
    (SELECT id FROM public.product_skus WHERE slug = 'commercial-solar-pro'),
    'https://images.unsplash.com/photo-1605980625600-88d6488c2a12?w=800',
    'CommercialSolar Pro Series installed on office building',
    true,
    1
  ),
  (
    (SELECT id FROM public.product_skus WHERE slug = 'commercial-solar-pro'),
    'https://images.unsplash.com/photo-1591411852252-1fbd9afe223f?w=800',
    'Commercial installation in progress',
    false,
    2
  );

-- Hybrid Residential/Commercial Product
INSERT INTO public.product_skus (
  name, 
  slug, 
  sku, 
  category_id,
  description,
  short_description,
  features,
  specifications,
  use_cases,
  has_subsidy,
  has_variants
) VALUES (
  'HybridPower Plus System',
  'hybridpower-plus',
  'HP-PLUS-2023',
  (SELECT id FROM public.product_categories WHERE slug = 'residential'),
  'The HybridPower Plus System is our versatile solution suitable for both residential and small commercial applications. Featuring integrated battery storage, this system provides power security during outages while optimizing daily energy usage. The intelligent energy management system automatically prioritizes self-consumption during peak rate hours, maximizing your savings.',
  'Complete solar + battery solution for energy independence and backup power.',
  '{
    "highlights": [
      "Integrated lithium battery storage",
      "Automatic backup power during outages",
      "Smart energy management system",
      "Time-of-use optimization",
      "Expandable battery capacity",
      "Virtual power plant ready"
    ]
  }'::jsonb,
  '{
    "panel_type": "Monocrystalline Half-Cut Cells",
    "panel_efficiency": "21.9%",
    "inverter_type": "Hybrid Inverter with Battery Management",
    "battery_type": "Lithium Iron Phosphate (LFP)",
    "battery_cycles": "Over 6000 cycles @ 80% DoD",
    "warranty": "25 years panels, 10 years inverter, 10 years battery",
    "monitoring": "Advanced home energy management system"
  }'::jsonb,
  ARRAY['Residential', 'Commercial'],
  true,
  true
);

-- Insert variants for HybridPower Plus
INSERT INTO public.product_variants (
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
) VALUES
  (
    (SELECT id FROM public.product_skus WHERE slug = 'hybridpower-plus'),
    '3kW + 5kWh',
    3,
    375000,
    40,
    240,
    3600,
    '2-3',
    false,
    6
  ),
  (
    (SELECT id FROM public.product_skus WHERE slug = 'hybridpower-plus'),
    '5kW + 10kWh',
    5,
    595000,
    40,
    400,
    6000,
    '3-4',
    true,
    5
  ),
  (
    (SELECT id FROM public.product_skus WHERE slug = 'hybridpower-plus'),
    '8kW + 15kWh',
    8,
    895000,
    30,
    640,
    9600,
    '4-6',
    false,
    3
  );

-- Insert images for HybridPower Plus
INSERT INTO public.product_images (
  product_id,
  url,
  alt_text,
  is_primary,
  display_order
) VALUES
  (
    (SELECT id FROM public.product_skus WHERE slug = 'hybridpower-plus'),
    'https://images.unsplash.com/photo-1609409612378-44c2d20cf806?w=800',
    'HybridPower Plus System with battery storage',
    true,
    1
  ),
  (
    (SELECT id FROM public.product_skus WHERE slug = 'hybridpower-plus'),
    'https://images.unsplash.com/photo-1592833159057-6faccfc08db7?w=800',
    'HybridPower Plus battery backup system',
    false,
    2
  ),
  (
    (SELECT id FROM public.product_skus WHERE slug = 'hybridpower-plus'),
    'https://images.unsplash.com/photo-1549828609-d9675799b599?w=800',
    'HybridPower energy management dashboard',
    false,
    3
  );

COMMIT;
