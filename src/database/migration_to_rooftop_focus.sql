-- Migration script to remove investment-related tables and columns
-- and update schema to focus exclusively on rooftop solar installations

-- Start a transaction to ensure all operations succeed or fail together
BEGIN;

-- 1. Drop investment-related tables (if they exist)
DROP TABLE IF EXISTS public.investments CASCADE;
DROP TABLE IF EXISTS public.solar_farms CASCADE;
DROP TABLE IF EXISTS public.investment_transactions CASCADE;
DROP TABLE IF EXISTS public.wattage_credits CASCADE;
DROP TABLE IF EXISTS public.dividend_payments CASCADE;

-- 2. Update support_tickets table IF IT EXISTS
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'support_tickets') THEN
    -- If constraint exists, drop it and recreate
    ALTER TABLE public.support_tickets 
      DROP CONSTRAINT IF EXISTS support_tickets_category_check;

    ALTER TABLE public.support_tickets
      ADD CONSTRAINT support_tickets_category_check 
      CHECK (category IN ('technical', 'billing', 'system', 'general'));
    
    -- Update existing tickets with 'investment' category to 'system'
    UPDATE public.support_tickets
      SET category = 'system'
      WHERE category = 'investment';
  END IF;
END $$;

-- 3. Update transaction table IF IT EXISTS
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transactions') THEN
    -- Check if investment_id column exists before renaming
    IF EXISTS (SELECT FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'transactions' 
               AND column_name = 'investment_id') THEN
      ALTER TABLE public.transactions
        RENAME COLUMN investment_id TO purchase_id;
    END IF;
    
    -- Handle constraint updates
    ALTER TABLE public.transactions
      DROP CONSTRAINT IF EXISTS transactions_type_check;

    ALTER TABLE public.transactions
      ADD CONSTRAINT transactions_type_check 
      CHECK (type IN ('purchase', 'refund', 'subscription', 'maintenance'));
    
    -- Update existing transactions with 'investment' type to 'purchase'
    UPDATE public.transactions
      SET type = 'purchase'
      WHERE type = 'investment';
  END IF;
END $$;

COMMIT;

-- Now create the product_skus table
-- Create product_skus table for rooftop solar installation products
CREATE TABLE IF NOT EXISTS public.product_skus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  capacity_kw DECIMAL(10, 2),
  description TEXT NOT NULL,
  specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  inventory_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create an index on the SKU for faster lookups
CREATE INDEX IF NOT EXISTS product_skus_sku_idx ON public.product_skus(sku);

-- Create an index on the category for filtering
CREATE INDEX IF NOT EXISTS product_skus_category_idx ON public.product_skus(category);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.product_skus;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.product_skus
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

-- Insert some initial sample data
INSERT INTO public.product_skus (name, sku, category, price, capacity_kw, description, specifications, inventory_count)
VALUES
  ('High-efficiency Monocrystalline Panel', 'SP-MONO-400W', 'panels', 18500.00, 0.4, 'Premium monocrystalline solar panel with industry-leading 22% efficiency', 
   '{
     "type": "Monocrystalline",
     "power": "400W",
     "efficiency": "22%",
     "dimensions": "1700 x 1000 x 40mm",
     "weight": "20kg",
     "warranty": "25 years",
     "manufacturer": "SunTech",
     "certifications": ["IEC 61215", "IEC 61730"]
   }'::jsonb, 
   45),
   
  ('Standard Polycrystalline Panel', 'SP-POLY-330W', 'panels', 12000.00, 0.33, 'Cost-effective polycrystalline solar panel with good performance', 
   '{
     "type": "Polycrystalline",
     "power": "330W",
     "efficiency": "18%",
     "dimensions": "1650 x 992 x 35mm",
     "weight": "18.5kg",
     "warranty": "20 years",
     "manufacturer": "GreenPower",
     "certifications": ["IEC 61215", "IEC 61730"]
   }'::jsonb, 
   30),
   
  ('Premium Hybrid Inverter', 'INV-HYB-5KW', 'inverters', 85000.00, 5.0, 'Advanced hybrid inverter with energy storage compatibility', 
   '{
     "type": "Hybrid",
     "capacity": "5kW",
     "phases": "Single",
     "efficiency": "97.5%",
     "mppt": 2,
     "dimensions": "516 x 440 x 184mm",
     "weight": "27kg",
     "warranty": "10 years",
     "manufacturer": "SolarEdge",
     "compatibility": ["Lithium-ion", "Lead-acid"]
   }'::jsonb, 
   12),
   
  ('Lithium Battery Storage', 'BAT-LI-10KWH', 'batteries', 120000.00, null, 'High-cycle lithium battery storage solution for residential use', 
   '{
     "type": "Lithium-ion",
     "capacity": "10kWh",
     "voltage": "48V",
     "depth_of_discharge": "95%",
     "cycle_life": "6000+ cycles",
     "dimensions": "584 x 478 x 193mm",
     "weight": "95kg",
     "warranty": "10 years",
     "manufacturer": "PowerWall"
   }'::jsonb, 
   8),
   
  ('Residential Roof Mounting System', 'MNT-ROOF-STD', 'mounting', 25000.00, null, 'Complete mounting system for residential pitched roofs', 
   '{
     "type": "Pitched Roof",
     "material": "Aluminum",
     "finish": "Anodized",
     "max_wind_load": "170km/h",
     "panels_capacity": "Up to 20 panels",
     "compatibility": "Universal",
     "warranty": "15 years",
     "includes": ["Rails", "Clamps", "Roof hooks", "Hardware"]
   }'::jsonb, 
   15),
   
  ('Premium 5kW Home Package', 'PKG-HOME-5KW', 'packages', 425000.00, 5.0, 'Complete 5kW residential package with premium components and installation included', 
   '{
     "panels": "13x High-efficiency Monocrystalline 400W",
     "inverter": "5kW Hybrid Inverter",
     "mounting": "Premium Roof Mounting System",
     "battery": "Optional 10kWh Lithium Battery",
     "monitoring": "Smart energy monitoring system",
     "installation": "Included",
     "warranty": "10 years system warranty",
     "estimated_production": "20kWh daily average",
     "includes": ["Design", "Permits", "Installation", "Monitoring"]
   }'::jsonb, 
   5);

COMMENT ON TABLE public.product_skus IS 'Table storing all rooftop solar product SKUs for Type 3 Solar Platform';
