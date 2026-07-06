-- ============================================================
-- 002_audit_and_fixes.sql
-- ============================================================
-- Aligns schema with code expectations, fixes RLS, ensures
-- storage policies allow admin uploads, and adds useful fields.
-- ============================================================

-- 1. Add image_url to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url text;

-- 2. Add tracking timestamps to orders (if missing)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_verified_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_last_name text NOT NULL DEFAULT '';

-- 3. Email logs: align with code usage (to_email, sent_at, message_id, error_message)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'to_email') THEN
    ALTER TABLE email_logs ADD COLUMN to_email text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'sent_at') THEN
    ALTER TABLE email_logs ADD COLUMN sent_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'message_id') THEN
    ALTER TABLE email_logs ADD COLUMN message_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'error_message') THEN
    ALTER TABLE email_logs ADD COLUMN error_message text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_logs' AND column_name = 'provider_message_id') THEN
    ALTER TABLE email_logs ADD COLUMN provider_message_id text;
  END IF;
END$$;

-- 4. Reviews: align with code usage (body, name)
-- Code uses `body` and `name`, migration has those. RLS allows any insert.
-- Ensure RLS allows anyone to insert reviews
DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;
CREATE POLICY "Anyone can insert reviews" ON reviews FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 5. Storage: allow admin uploads to product-images bucket
-- The current policy uses JWT role. Allow service role uploads as well by ensuring bucket exists.
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Re-create storage policies for product-images
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- 6. Inquiries: align with code usage. Code uses `name, contact, message, status, email` (via service)
-- Add email column if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inquiries' AND column_name = 'email') THEN
    ALTER TABLE inquiries ADD COLUMN email text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inquiries' AND column_name = 'subject') THEN
    ALTER TABLE inquiries ADD COLUMN subject text;
  END IF;
END$$;

-- 7. Site settings: ensure value column is text and upsertable
-- (no changes needed - already correct)

-- 8. Cart: fix RLS so anyone can read/insert/update/delete (current allows public which is good)
-- But for service-role paths, no RLS is needed.

-- 9. Create index on idempotency_key if not exists (already in initial migration)
CREATE INDEX IF NOT EXISTS idx_orders_idempotency_key ON orders(idempotency_key);

-- 10. Make sure payment_status check allows 'verified', 'rejected', 'pending', 'submitted', 'paid', 'failed'
-- No check constraint in initial migration, so any string is allowed.

-- 11. Make sure order status check is permissive (it is - no check constraint)
