-- ============================================================
-- Migration 003: Reviews Table
-- ============================================================
-- Run this in the Supabase SQL Editor.
-- ============================================================

CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_reviews_product_id ON reviews (product_id);
CREATE INDEX idx_reviews_status ON reviews (status);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved reviews
CREATE POLICY "Anyone can read approved reviews"
  ON reviews
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Authenticated users can insert reviews
CREATE POLICY "Authenticated users can insert reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage all reviews"
  ON reviews
  FOR ALL
  TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
