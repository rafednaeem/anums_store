-- ============================================================
-- Migration 001: Row Level Security Policies
-- ============================================================
-- Run this in the Supabase SQL Editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_last_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  postal_code text,
  items jsonb NOT NULL,
  subtotal numeric NOT NULL,
  shipping numeric NOT NULL,
  total numeric NOT NULL,
  payment_method text NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  status text NOT NULL DEFAULT 'processing',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ── orders ────────────────────────────────────────────────

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Public checkout: anyone can insert a new order
CREATE POLICY "Anyone can insert orders"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Order confirmation lookup: anyone can read a specific order
-- (this powers /order-confirmation which queries by id)
CREATE POLICY "Anyone can read orders by id"
  ON orders
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Payment webhook: payment-confirm route updates payment_status
CREATE POLICY "Anyone can update orders"
  ON orders
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ── inquiries ─────────────────────────────────────────────

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Contact form: anyone can submit an inquiry
CREATE POLICY "Anyone can insert inquiries"
  ON inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ── Future / Admin policies ──
-- These policies use the 'role' column in auth.users.app_metadata.

CREATE POLICY "Admins can view all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admins can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admins can view inquiries"
  ON inquiries
  FOR SELECT
  TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');


-- ============================================================
-- Migration 002: Add user_id column to orders
-- ============================================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);


-- ============================================================
-- Migration 003: Addresses table
-- ============================================================
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text DEFAULT 'Other',
  name text NOT NULL,
  "lastName" text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  postal_code text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses (user_id);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Note: the previous policy might fail if the user_id type mismatch, but we will create it:
CREATE POLICY "Users can manage their own addresses"
  ON addresses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- Migration 004: Add status column to inquiries
-- ============================================================
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS status text DEFAULT 'new';
UPDATE inquiries SET status = 'new' WHERE status IS NULL;
