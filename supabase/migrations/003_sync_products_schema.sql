-- ============================================================
-- 003_sync_products_schema.sql
-- ============================================================
-- Syncs the live database schema with what the code expects.
-- Safe to run multiple times (IF NOT EXISTS / IF EXISTS).
-- ============================================================

-- 1. products: add columns the code writes that may be missing
ALTER TABLE products ADD COLUMN IF NOT EXISTS cover_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_price integer;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_on_sale boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS craft_type text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS catalog_url text;

-- 2. product_images: rename 'url' → 'image_url' to match code
ALTER TABLE product_images DROP COLUMN IF EXISTS image_url;
ALTER TABLE product_images ALTER COLUMN url RENAME TO image_url;

-- 3. product_variants: add columns the code writes that may be missing
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS color_hex text;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- 4. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
