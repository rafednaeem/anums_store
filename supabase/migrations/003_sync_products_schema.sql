-- ============================================================
-- 003_sync_products_schema.sql
-- ============================================================
-- Adds all missing columns to the products table so the
-- application code can insert/update without 500 errors.
-- Safe to run multiple times (IF NOT EXISTS).
-- ============================================================

-- 1. Add missing columns to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_price integer;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price integer;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_on_sale boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS craft_type text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS catalog_url text;

-- 2. Ensure updated_at trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at'
  ) THEN
    CREATE TRIGGER update_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

-- 3. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
