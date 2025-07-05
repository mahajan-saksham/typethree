-- Enhance product_variants table with more variant-specific attributes
ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS variant_name TEXT,
  ADD COLUMN IF NOT EXISTS variant_sku TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS specifications JSONB,
  ADD COLUMN IF NOT EXISTS features JSONB,
  ADD COLUMN IF NOT EXISTS payback_period NUMERIC,
  ADD COLUMN IF NOT EXISTS generation TEXT,
  ADD COLUMN IF NOT EXISTS panel_type TEXT;

-- Add indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_product_variants_variant_sku ON product_variants(variant_sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_capacity ON product_variants(capacity_kw);