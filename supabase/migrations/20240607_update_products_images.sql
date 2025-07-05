-- Update product_skus table to include image fields
ALTER TABLE product_skus 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS warranty_years INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS installation_time TEXT DEFAULT '3-4';

-- Create product_images table for multiple images per product
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_sku_id UUID NOT NULL REFERENCES product_skus(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_images_sku ON product_images(product_sku_id);

-- Update existing products with sample data
UPDATE product_skus SET 
  image_url = CASE 
    WHEN capacity_kw = 1 THEN 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80'
    WHEN capacity_kw = 3 THEN 'https://images.unsplash.com/photo-1595437193398-f24279553f4f?auto=format&fit=crop&w=800&q=80'
    WHEN capacity_kw = 5 THEN 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?auto=format&fit=crop&w=800&q=80'
    WHEN capacity_kw = 10 THEN 'https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?auto=format&fit=crop&w=800&q=80'
    WHEN capacity_kw = 25 THEN 'https://images.unsplash.com/photo-1584276433295-4b49a252e5ee?auto=format&fit=crop&w=800&q=80'
    ELSE 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80'
  END,
  warranty_years = 25,
  installation_time = CASE 
    WHEN capacity_kw <= 3 THEN '3-4 days'
    WHEN capacity_kw <= 10 THEN '5-7 days'
    ELSE '10-14 days'
  END
WHERE image_url IS NULL;