-- ─────────────────────────────────────────────────────────────────────────────
-- supabase-independent-showcase-migration.sql
-- Adds an additional RLS SELECT policy so any authenticated user can read
-- independent projects whose status = 'completed'. This enables the community
-- Showcase gallery while keeping in_progress / submitted projects private to
-- their owner.
--
-- How it interacts with the existing policy:
--   PostgreSQL RLS combines multiple SELECT policies on the same table with OR,
--   so the effective rule becomes:
--     (student_id = auth.uid() OR role IN ('admin','mentor'))  -- existing policy
--     OR status = 'completed'                                  -- this policy
--   Result:
--     • Owners see ALL of their own projects (any status)
--     • Any authenticated user sees EVERY completed project (community showcase)
--     • Non-owners CANNOT see another student's in_progress / submitted projects
--
-- INSERT / UPDATE / DELETE policies are UNCHANGED — a student still can only
-- create or modify their OWN independent projects.
--
-- Run in the Supabase SQL editor after the original independent_projects table
-- and base policies have been applied.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Completed independent projects viewable by all authenticated"
  ON independent_projects;

CREATE POLICY "Completed independent projects viewable by all authenticated"
  ON independent_projects FOR SELECT TO authenticated
  USING (status = 'completed');
