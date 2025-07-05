-- Add the default_variant_id column to product_skus
ALTER TABLE public.product_skus
ADD COLUMN default_variant_id uuid NULL;

-- Add a foreign key constraint to ensure it references a valid variant
-- Set to NULL if the referenced variant is deleted
ALTER TABLE public.product_skus
ADD CONSTRAINT fk_product_skus_default_variant
FOREIGN KEY (default_variant_id)
REFERENCES public.product_variants(id)
ON DELETE SET NULL;