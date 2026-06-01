-- ============================================================
-- Migration 002: Admin Role Setup
-- ============================================================
-- Run this in the Supabase SQL Editor AFTER creating your
-- admin user (sign up via the app, then run this with your
-- admin user's email).
-- ============================================================

-- 1. Set the admin role for a specific user (replace with your email)
-- This stores the role in app_metadata, which is available as a JWT claim.

UPDATE auth.users
SET raw_app_meta_data =
  raw_app_meta_data || '{"role":"admin"}'::jsonb
WHERE email = 'rafedsarmad@gmail.com';

-- 2. Verify the JWT contains the admin claim
-- Run this after signing in as the admin user:
-- SELECT auth.jwt() -> 'app_metadata' ->> 'role' AS role;
-- Expected result: "admin"
