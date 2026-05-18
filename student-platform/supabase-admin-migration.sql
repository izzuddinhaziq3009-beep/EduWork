-- ============================================================
-- Admin features migration
-- Run in the Supabase SQL Editor
-- ============================================================

-- Add is_active to profiles (for soft user deactivation)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Index for faster user management queries
CREATE INDEX IF NOT EXISTS idx_profiles_role     ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- RLS policy: admins can update any profile (including is_active)
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
