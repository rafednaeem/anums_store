-- ============================================================
-- Page Content CMS Table
-- ============================================================
-- Stores editable content for all pages, sections, and keys.
-- ============================================================

CREATE TABLE IF NOT EXISTS page_content (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_slug text NOT NULL,
  section_key text NOT NULL,
  content_key text NOT NULL,
  content_value text,
  content_type text DEFAULT 'text',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page_slug, section_key, content_key)
);

-- Fast lookups by page
CREATE INDEX IF NOT EXISTS idx_page_content_page_slug ON page_content (page_slug);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read
CREATE POLICY "Anyone can read page_content"
  ON page_content FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admins can manage all
CREATE POLICY "Admins can manage page_content"
  ON page_content FOR ALL
  TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- ============================================================
-- updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_page_content_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_page_content_updated_at ON page_content;
CREATE TRIGGER update_page_content_updated_at
  BEFORE UPDATE ON page_content
  FOR EACH ROW
  EXECUTE FUNCTION update_page_content_updated_at();
