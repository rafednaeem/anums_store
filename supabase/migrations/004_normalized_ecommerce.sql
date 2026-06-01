-- ============================================================
-- Migration 004: Supabase-native normalized ecommerce schema
-- ============================================================
-- Hybrid schema inspired by the previous MySQL platform, adapted
-- for Supabase Auth, UUID primary keys, Storage URLs, and RLS.
-- This migration is additive/preserving: it keeps existing rows
-- and backfills normalized tables from existing JSON/array fields.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

INSERT INTO categories (name, slug)
VALUES
  ('Women Suits', 'women-suits'),
  ('Ready to Wear', 'ready-to-wear'),
  ('Bridal', 'bridal'),
  ('Stitched Dresses', 'stitched-dresses'),
  ('Unstitched Fabric', 'unstitched-fabric'),
  ('Accessories', 'accessories'),
  ('Corporate Gifting', 'corporate-gifting'),
  ('Kids', 'kids')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text DEFAULT 'Women Suits',
  price integer NOT NULL DEFAULT 0,
  sale_price integer,
  description text,
  sizes text[] DEFAULT '{}',
  quantity integer NOT NULL DEFAULT 0,
  in_stock boolean NOT NULL DEFAULT true,
  on_sale boolean NOT NULL DEFAULT false,
  show_price boolean NOT NULL DEFAULT true,
  cover_url text,
  gallery_urls text[] DEFAULT '{}',
  catalog_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock integer;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active boolean;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_on_sale boolean;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cover_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS catalog_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS instagram_id text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

UPDATE products
SET stock = COALESCE(stock, quantity, 0)
WHERE stock IS NULL;

UPDATE products
SET is_active = COALESCE(is_active, in_stock, true)
WHERE is_active IS NULL;

UPDATE products
SET is_on_sale = COALESCE(is_on_sale, on_sale, false)
WHERE is_on_sale IS NULL;

INSERT INTO categories (name, slug)
SELECT DISTINCT
  COALESCE(NULLIF(category, ''), 'Women Suits') AS name,
  regexp_replace(lower(COALESCE(NULLIF(category, ''), 'Women Suits')), '[^a-z0-9]+', '-', 'g') AS slug
FROM products
WHERE category_id IS NULL
ON CONFLICT (slug) DO NOTHING;

UPDATE products p
SET category_id = c.id
FROM categories c
WHERE p.category_id IS NULL
  AND c.slug = regexp_replace(lower(COALESCE(NULLIF(p.category, ''), 'Women Suits')), '[^a-z0-9]+', '-', 'g');

CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

INSERT INTO product_images (product_id, image_url, sort_order)
SELECT p.id, image_url, ordinal::integer
FROM products p
CROSS JOIN LATERAL unnest(COALESCE(p.gallery_urls, ARRAY[]::text[])) WITH ORDINALITY AS gallery(image_url, ordinal)
WHERE image_url IS NOT NULL
  AND image_url <> ''
  AND NOT EXISTS (
    SELECT 1 FROM product_images pi
    WHERE pi.product_id = p.id AND pi.image_url = image_url
  );

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_slug text,
  product_name text NOT NULL,
  product_image text,
  size text,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  total_price numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount numeric(12,2);
UPDATE orders SET total_amount = COALESCE(total_amount, total, 0) WHERE total_amount IS NULL;

INSERT INTO order_items (
  order_id,
  product_id,
  product_slug,
  product_name,
  product_image,
  size,
  quantity,
  unit_price,
  total_price
)
SELECT
  o.id,
  p.id,
  item->>'id',
  COALESCE(item->>'name', 'Product'),
  NULLIF(item->>'image', ''),
  NULLIF(item->>'size', ''),
  COALESCE((item->>'quantity')::integer, 1),
  COALESCE((item->>'price')::numeric, 0),
  COALESCE((item->>'price')::numeric, 0) * COALESCE((item->>'quantity')::integer, 1)
FROM orders o
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(o.items, '[]'::jsonb)) AS item
LEFT JOIN products p ON p.slug = item->>'id'
WHERE NOT EXISTS (
  SELECT 1 FROM order_items oi
  WHERE oi.order_id = o.id
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method text NOT NULL,
  reference text,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  gateway_payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

INSERT INTO payments (order_id, method, amount, status)
SELECT
  id,
  payment_method,
  total,
  payment_status
FROM orders o
WHERE NOT EXISTS (
  SELECT 1 FROM payments p WHERE p.order_id = o.id
);

CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  product_slug text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

DO $$
BEGIN
  IF to_regclass('public.reviews') IS NOT NULL THEN
    INSERT INTO product_reviews (product_id, product_slug, user_id, name, rating, title, body, status, created_at)
    SELECT
      p.id,
      r.product_id,
      r.user_id,
      r.name,
      r.rating,
      r.title,
      r.body,
      r.status,
      r.created_at
    FROM reviews r
    LEFT JOIN products p ON p.slug = r.product_id
    WHERE NOT EXISTS (
      SELECT 1 FROM product_reviews pr
      WHERE pr.product_slug = r.product_id
        AND pr.name = r.name
        AND pr.body = r.body
        AND pr.created_at = r.created_at
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS cart (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  size text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, product_id, size)
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  type text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_key text NOT NULL UNIQUE,
  meta_value text,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exhibitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date timestamptz NOT NULL,
  end_date date,
  start_time text,
  end_time text,
  image_url text,
  video_url text,
  media_url text,
  media_type text CHECK (media_type IN ('image', 'video')),
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_slug ON product_reviews(product_slug);
CREATE INDEX IF NOT EXISTS idx_product_reviews_status ON product_reviews(status);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read categories" ON categories;
CREATE POLICY "Public can read categories"
  ON categories FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can read active products" ON products;
CREATE POLICY "Public can read active products"
  ON products FOR SELECT TO anon, authenticated USING (COALESCE(is_active, in_stock, true) = true);

DROP POLICY IF EXISTS "Public can read product images" ON product_images;
CREATE POLICY "Public can read product images"
  ON product_images FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public checkout can insert order items" ON order_items;
CREATE POLICY "Public checkout can insert order items"
  ON order_items FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read order items" ON order_items;
CREATE POLICY "Public can read order items"
  ON order_items FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public checkout can insert payments" ON payments;
CREATE POLICY "Public checkout can insert payments"
  ON payments FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read own payment by order" ON payments;
CREATE POLICY "Public can read own payment by order"
  ON payments FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can read approved product reviews" ON product_reviews;
CREATE POLICY "Anyone can read approved product reviews"
  ON product_reviews FOR SELECT TO anon, authenticated USING (status = 'approved');

DROP POLICY IF EXISTS "Anyone can insert product reviews" ON product_reviews;
CREATE POLICY "Anyone can insert product reviews"
  ON product_reviews FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage own wishlist" ON wishlists;
CREATE POLICY "Users can manage own wishlist"
  ON wishlists FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own cart" ON cart;
CREATE POLICY "Users can manage own cart"
  ON cart FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can read active exhibitions" ON exhibitions;
CREATE POLICY "Public can read active exhibitions"
  ON exhibitions FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Admins manage categories" ON categories;
CREATE POLICY "Admins manage categories"
  ON categories FOR ALL TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins manage products" ON products;
CREATE POLICY "Admins manage products"
  ON products FOR ALL TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins manage product images" ON product_images;
CREATE POLICY "Admins manage product images"
  ON product_images FOR ALL TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins manage order items" ON order_items;
CREATE POLICY "Admins manage order items"
  ON order_items FOR ALL TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins manage payments" ON payments;
CREATE POLICY "Admins manage payments"
  ON payments FOR ALL TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins manage product reviews" ON product_reviews;
CREATE POLICY "Admins manage product reviews"
  ON product_reviews FOR ALL TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins manage notifications" ON notifications;
CREATE POLICY "Admins manage notifications"
  ON notifications FOR ALL TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins manage settings" ON admin_settings;
CREATE POLICY "Admins manage settings"
  ON admin_settings FOR ALL TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins manage exhibitions" ON exhibitions;
CREATE POLICY "Admins manage exhibitions"
  ON exhibitions FOR ALL TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
