-- ============================================================
-- Migration 007: Fix RLS Policies + Idempotency Column
-- ============================================================
-- Addresses C-01 (public order updates), H-02 (public reads),
-- and M-04 (duplicate order protection).
-- ============================================================

-- M-04: Add idempotency key column for duplicate order protection
ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key text;
CREATE INDEX IF NOT EXISTS idx_orders_idempotency_key ON orders (idempotency_key);

-- ── C-01: Remove dangerous public update policy ────────────
DROP POLICY IF EXISTS "Anyone can update orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- Only admins can update orders
CREATE POLICY "Admins can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- ── H-02: Restrict order reads ────────────────────────────
-- Remove the wide-open read policy
DROP POLICY IF EXISTS "Anyone can read orders by id" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

-- Users can read their own orders (via user_id)
-- Admins can read all orders
-- Order-confirmation uses the service-role client (bypasses RLS)
CREATE POLICY "Users and admins can read orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );
