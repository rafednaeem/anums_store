-- Add sku column to product_variants (missing from live DB)
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS sku text;
