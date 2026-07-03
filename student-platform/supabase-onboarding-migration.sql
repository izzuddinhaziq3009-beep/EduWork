-- ─────────────────────────────────────────────────────────────────────────────
-- supabase-onboarding-migration.sql
-- Adds the `onboarded` flag to profiles so the guided tour shows only once.
--
-- Run in the Supabase SQL editor.
-- Prerequisite: profiles table must already exist.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Add column (idempotent) ────────────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarded BOOLEAN NOT NULL DEFAULT FALSE;

-- ── 2. RPC: mark_profile_onboarded ───────────────────────────────────────────
-- Uses SECURITY DEFINER so the update bypasses RLS without requiring a broad
-- UPDATE policy on profiles. Only the calling user's own row is touched.

CREATE OR REPLACE FUNCTION mark_profile_onboarded()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  UPDATE profiles SET onboarded = TRUE WHERE id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION mark_profile_onboarded() TO authenticated;
