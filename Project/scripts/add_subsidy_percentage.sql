-- Add subsidy_percentage column to product_skus table
ALTER TABLE public.product_skus ADD COLUMN IF NOT EXISTS subsidy_percentage NUMERIC DEFAULT 35;
