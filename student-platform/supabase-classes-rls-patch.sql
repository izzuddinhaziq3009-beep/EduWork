-- ─────────────────────────────────────────────────────────────────────────────
-- supabase-classes-rls-patch.sql
-- Run this in the Supabase SQL editor if you already ran supabase-classes-migration.sql.
--
-- Problem:
--   "Students view enrolled classes" on classes  → subquery on class_enrollments
--   "Mentors view class rosters"    on class_enrollments → subquery on classes
--   Once class_enrollments has rows, this indirect recursion causes PostgreSQL to
--   exceed max_stack_depth.  The mentor's SELECT on classes errors out, TanStack
--   Query falls back to the previous empty cache, and the class list shows blank.
--
-- Fix:
--   Replace the recursive subquery in "Mentors view class rosters" with a
--   SECURITY DEFINER helper that reads classes.mentor_id without applying RLS,
--   breaking the cycle.
-- ─────────────────────────────────────────────────────────────────────────────

-- Helper: returns the mentor_id for a class, bypassing classes RLS.
CREATE OR REPLACE FUNCTION class_mentor_id(p_class_id UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT mentor_id FROM classes WHERE id = p_class_id;
$$;

GRANT EXECUTE ON FUNCTION class_mentor_id(UUID) TO authenticated;

-- Drop the circular policy and replace it with one that uses the helper.
DROP POLICY IF EXISTS "Mentors view class rosters" ON class_enrollments;

CREATE POLICY "Mentors view class rosters"
  ON class_enrollments FOR SELECT
  USING (class_mentor_id(class_id) = auth.uid());
