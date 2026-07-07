-- ============================================================
-- 003_add_products_catalog_url.sql
-- ============================================================
-- The application previously tried to write a `catalog_url`
-- column that did not exist in the live database, causing a
-- 500 on product create/update. This migration adds it (idempotent).
-- Only run this if you actually want the catalog_url feature;
-- the app code no longer depends on this column.
-- ============================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS catalog_url text;

-- Refresh PostgREST schema cache so the column is recognized.
NOTIFY pgrst, 'reload schema';
