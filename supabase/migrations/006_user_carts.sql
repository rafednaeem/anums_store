-- ============================================================
-- Migration 006: User Carts (per-account cart storage)
-- ============================================================
-- Stores cart items as JSONB for authenticated users.
-- Guests use localStorage (not affected by this migration).
-- ============================================================

CREATE TABLE IF NOT EXISTS user_carts (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart"
  ON user_carts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
