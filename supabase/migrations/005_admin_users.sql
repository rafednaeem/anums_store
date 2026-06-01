-- ============================================================
-- Migration 005: Admin Users Table
-- ============================================================
-- Creates an admin_users table as the source of truth for
-- admin access, with a trigger that syncs the role to
-- auth.users.app_metadata (JWT claims) automatically.
--
-- Usage:
--   After a user signs up via the app, find their UUID in
--   Supabase Auth -> Users, then run:
--     INSERT INTO admin_users (user_id) VALUES ('<uuid>');
--
--   The user must log out and log back in for the JWT to
--   include the admin claim.
-- ============================================================

-- 1. Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  granted_by uuid REFERENCES auth.users(id),
  UNIQUE (user_id),
  UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users (user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users (email);

-- 2. Function: sync admin role to auth.users JWT metadata
CREATE OR REPLACE FUNCTION sync_admin_role()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE auth.users
    SET raw_app_meta_data =
      COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE auth.users
    SET raw_app_meta_data =
      raw_app_meta_data - 'role'
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
END;
$$;

-- 3. Trigger: runs after insert/delete on admin_users
DROP TRIGGER IF EXISTS trg_sync_admin_role ON admin_users;
CREATE TRIGGER trg_sync_admin_role
  AFTER INSERT OR DELETE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION sync_admin_role();

-- 4. Function: promote a user to admin by email (call this from SQL editor)
CREATE OR REPLACE FUNCTION grant_admin(target_email text)
RETURNS text
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  uid uuid;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = target_email;
  IF uid IS NULL THEN
    RETURN 'User not found: ' || target_email;
  END IF;
  INSERT INTO admin_users (user_id, email)
  VALUES (uid, target_email)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN 'Admin granted to: ' || target_email;
END;
$$;

-- 4. Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies
-- Only existing admins can view the admin list
CREATE POLICY "Admins can view admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- Only existing admins can add new admins
CREATE POLICY "Admins can insert admin_users"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- Only existing admins can remove admins
CREATE POLICY "Admins can delete admin_users"
  ON admin_users
  FOR DELETE
  TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- 7. Migrate existing admin user (if they exist in auth.users)
INSERT INTO admin_users (user_id, email)
SELECT id, email FROM auth.users WHERE email = 'rafedsarmad@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- 8. View: list all users from auth (run this in SQL editor to see who's registered)
-- CREATE OR REPLACE VIEW public.user_list AS
-- SELECT id, email, created_at, last_sign_in_at,
--   raw_app_meta_data -> 'role' AS role
-- FROM auth.users
-- ORDER BY created_at DESC;

-- Usage in SQL Editor:
--   SELECT * FROM user_list;
--   SELECT grant_admin('someone@example.com');
