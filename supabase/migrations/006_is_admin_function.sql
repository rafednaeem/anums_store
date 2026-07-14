-- ============================================================
-- Migration 006: is_admin() function for RLS policies
-- ============================================================
-- Creates a PostgreSQL function that reads the JWT to determine
-- if the current user has admin role. Use in RLS policies as:
--   USING (is_admin())
-- ============================================================

-- is_admin() reads the JWT app_metadata role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ============================================================
-- Verify triggers exist for role sync
-- ============================================================

-- Ensure handle_new_user trigger exists (auto-create profile on signup)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', NULL)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Ensure sync_role_to_metadata trigger exists
CREATE OR REPLACE FUNCTION sync_role_to_metadata()
RETURNS trigger
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    UPDATE auth.users
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
    WHERE id = NEW.id;
  ELSE
    UPDATE auth.users
    SET raw_app_meta_data = raw_app_meta_data - 'role'
    WHERE id = NEW.id AND raw_app_meta_data ->> 'role' = 'admin';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_role_change ON profiles;
CREATE TRIGGER on_profile_role_change
  AFTER INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_role_to_metadata();

-- ============================================================
-- Notify PostgREST to reload schema
-- ============================================================
NOTIFY pgrst, 'reload schema';
