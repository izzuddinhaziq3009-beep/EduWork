-- ============================================================
-- Rebuild learning_modules RLS from a guaranteed-clean slate.
-- Instead of guessing policy names, this drops EVERY existing
-- policy on the table programmatically, then recreates a clean,
-- correct set. Safe to re-run.
-- ============================================================

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'learning_modules'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.learning_modules', pol.policyname);
  END LOOP;
END $$;

-- Confirms the table is now policy-free before we rebuild (should return 0 rows).
SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'learning_modules';

-- Make sure RLS is actually enabled (it should already be, but just in case).
ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;

-- SELECT: active modules visible to everyone signed in or anonymous;
-- admins/mentors and the creator can also see inactive/draft ones.
CREATE POLICY "modules_select_active_or_owner_or_staff"
  ON learning_modules FOR SELECT TO authenticated
  USING (
    is_active = TRUE
    OR created_by = auth.uid()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor')
  );

CREATE POLICY "modules_select_anon_active"
  ON learning_modules FOR SELECT TO anon
  USING (is_active = TRUE);

CREATE POLICY "modules_insert_staff"
  ON learning_modules FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor'));

CREATE POLICY "modules_update_staff"
  ON learning_modules FOR UPDATE TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor'))
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor'));

CREATE POLICY "modules_delete_staff"
  ON learning_modules FOR DELETE TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor'));

-- Final check: should show exactly 5 rows (one per policy above).
SELECT policyname, cmd, roles FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'learning_modules';
