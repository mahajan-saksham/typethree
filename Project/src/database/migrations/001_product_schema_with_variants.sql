-- Migration: Product Schema with Variants
-- Description: Implements a comprehensive product database schema with support for variants, 
--              categories, specifications, and images

-- Start transaction to ensure all changes are applied together
BEGIN;

-- Create product_categories table
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on category slug
CREATE INDEX IF NOT EXISTS product_categories_slug_idx ON public.product_categories(slug);

-- Create product_skus table with enhanced structure
CREATE TABLE IF NOT EXISTS public.product_skus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES public.product_categories(id),
  description TEXT,
  short_description TEXT,
  features JSONB,
  specifications JSONB DEFAULT '{}'::jsonb,
  use_cases TEXT[], -- Residential, Commercial, Industrial
  has_subsidy BOOLEAN DEFAULT true,
  has_variants BOOLEAN DEFAULT true,
  variant_name TEXT DEFAULT 'Capacity',
  is_active BOOLEAN DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indices for product lookups
CREATE INDEX IF NOT EXISTS product_skus_slug_idx ON public.product_skus(slug);
CREATE INDEX IF NOT EXISTS product_skus_sku_idx ON public.product_skus(sku);
CREATE INDEX IF NOT EXISTS product_skus_category_id_idx ON public.product_skus(category_id);
CREATE INDEX IF NOT EXISTS product_skus_use_cases_idx ON public.product_skus USING GIN(use_cases);

-- Create product_variants table
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.product_skus(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity_kw NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  subsidy_percentage NUMERIC DEFAULT 40,
  subsidized_price NUMERIC GENERATED ALWAYS AS (price * (1 - subsidy_percentage / 100)) STORED,
  area_required_sqft NUMERIC,
  monthly_savings NUMERIC,
  installation_days TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  inventory_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, capacity_kw) -- Ensures unique capacity per product
);

-- Create indices for variant lookups
CREATE INDEX IF NOT EXISTS product_variants_product_id_idx ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS product_variants_capacity_idx ON public.product_variants(capacity_kw);

-- Create product_images table
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.product_skus(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for product images
CREATE INDEX IF NOT EXISTS product_images_product_id_idx ON public.product_images(product_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
DROP TRIGGER IF EXISTS update_product_categories_timestamp ON public.product_categories;
CREATE TRIGGER update_product_categories_timestamp
BEFORE UPDATE ON public.product_categories
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_product_skus_timestamp ON public.product_skus;
CREATE TRIGGER update_product_skus_timestamp
BEFORE UPDATE ON public.product_skus
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_product_variants_timestamp ON public.product_variants;
CREATE TRIGGER update_product_variants_timestamp
BEFORE UPDATE ON public.product_variants
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_product_images_timestamp ON public.product_images;
CREATE TRIGGER update_product_images_timestamp
BEFORE UPDATE ON public.product_images
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Create function to ensure only one default variant per product
CREATE OR REPLACE FUNCTION ensure_one_default_variant()
RETURNS TRIGGER AS $$
BEGIN
  -- If this variant is set as default
  IF NEW.is_default THEN
    -- Set all other variants for this product to non-default
    UPDATE public.product_variants
    SET is_default = false
    WHERE product_id = NEW.product_id AND id != NEW.id;
  ELSE
    -- Check if this was the only default and there are other variants
    IF (SELECT COUNT(*) FROM public.product_variants WHERE product_id = NEW.product_id AND is_default = true) = 0 AND
       (SELECT COUNT(*) FROM public.product_variants WHERE product_id = NEW.product_id) > 0 THEN
      -- Make the first variant the default
      UPDATE public.product_variants
      SET is_default = true
      WHERE id = (
        SELECT id FROM public.product_variants 
        WHERE product_id = NEW.product_id 
        ORDER BY capacity_kw
        LIMIT 1
      );
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for default variant management
DROP TRIGGER IF EXISTS ensure_one_default_variant_trigger ON public.product_variants;
CREATE TRIGGER ensure_one_default_variant_trigger
AFTER INSERT OR UPDATE ON public.product_variants
FOR EACH ROW EXECUTE FUNCTION ensure_one_default_variant();

-- ROW LEVEL SECURITY (RLS) Policies
-- Enable RLS on tables
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY product_categories_select_policy ON public.product_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY product_skus_select_policy ON public.product_skus
  FOR SELECT USING (is_active = true);
  
CREATE POLICY product_variants_select_policy ON public.product_variants
  FOR SELECT USING (
    is_active = true AND 
    EXISTS (SELECT 1 FROM public.product_skus WHERE id = product_variants.product_id AND is_active = true)
  );
  
CREATE POLICY product_images_select_policy ON public.product_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.product_skus WHERE id = product_images.product_id AND is_active = true)
  );

-- Create RLS policies for admin access
CREATE POLICY product_categories_admin_policy ON public.product_categories
  USING (auth.role() = 'authenticated' AND auth.uid() IN (SELECT user_id FROM admin_users));
  
CREATE POLICY product_skus_admin_policy ON public.product_skus
  USING (auth.role() = 'authenticated' AND auth.uid() IN (SELECT user_id FROM admin_users));
  
CREATE POLICY product_variants_admin_policy ON public.product_variants
  USING (auth.role() = 'authenticated' AND auth.uid() IN (SELECT user_id FROM admin_users));
  
CREATE POLICY product_images_admin_policy ON public.product_images
  USING (auth.role() = 'authenticated' AND auth.uid() IN (SELECT user_id FROM admin_users));

-- Insert default product categories
INSERT INTO public.product_categories (name, slug, description, icon_name, display_order)
VALUES
  ('Residential', 'residential', 'Solar solutions for homes and residential properties', 'home', 1),
  ('Commercial', 'commercial', 'Solar solutions for businesses and commercial properties', 'building', 2),
  ('Industrial', 'industrial', 'Solar solutions for industrial facilities and large-scale applications', 'factory', 3),
  ('Accessories', 'accessories', 'Components and accessories for solar installations', 'layers', 4);

-- Comment on tables
COMMENT ON TABLE public.product_categories IS 'Product categories for Type 3 Solar Platform';
COMMENT ON TABLE public.product_skus IS 'Product SKUs for Type 3 Solar Platform';
COMMENT ON TABLE public.product_variants IS 'Product variants with different capacities, prices, and specifications';
COMMENT ON TABLE public.product_images IS 'Product images, including primary images and additional photos';

COMMIT;
