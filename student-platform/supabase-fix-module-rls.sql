-- ============================================================
-- Fix learning_modules RLS so admin (and mentor) INSERT/UPDATE/DELETE
-- actually passes the row-level security check.
-- Safe to re-run: all statements are idempotent.
-- ============================================================

-- Re-assert the thumbnail columns in case supabase-module-thumbnails-migration.sql
-- hasn't been run yet on this database (harmless no-op if it already has).
ALTER TABLE learning_modules
  ADD COLUMN IF NOT EXISTS module_image_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS module_color VARCHAR(50);

-- Drop whatever policies currently exist on this table (both the names used by
-- this project's original setup script, and the names suggested in the bug
-- report, in case either was applied previously) so we start from a clean slate.
DROP POLICY IF EXISTS "Active modules viewable by authenticated users" ON learning_modules;
DROP POLICY IF EXISTS "Admins and mentors can manage modules"          ON learning_modules;
DROP POLICY IF EXISTS "Admins can create modules"                      ON learning_modules;
DROP POLICY IF EXISTS "Admins can update modules"                      ON learning_modules;
DROP POLICY IF EXISTS "Admins can delete modules"                      ON learning_modules;
DROP POLICY IF EXISTS "Users can view active modules"                  ON learning_modules;
DROP POLICY IF EXISTS "Anyone can view active modules"                 ON learning_modules;
DROP POLICY IF EXISTS "Admins can view all modules"                    ON learning_modules;

-- SELECT: active modules are visible to everyone signed in; admins/mentors and
-- the module's own creator can also see inactive/draft ones.
CREATE POLICY "Modules viewable by authenticated users"
  ON learning_modules FOR SELECT TO authenticated
  USING (
    is_active = TRUE
    OR created_by = auth.uid()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor')
  );

-- INSERT: admins/mentors can create modules. WITH CHECK is required for INSERT —
-- a bare USING-only "FOR ALL" policy (as previously defined) relies on Postgres
-- silently reusing USING as the check, which is the most likely source of the
-- "new row violates row-level security policy" error if anything about that
-- implicit fallback didn't apply as expected.
CREATE POLICY "Admins and mentors can create modules"
  ON learning_modules FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor'));

-- UPDATE: same role check on both the existing row and the new values.
CREATE POLICY "Admins and mentors can update modules"
  ON learning_modules FOR UPDATE TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor'))
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor'));

-- DELETE: same role check.
CREATE POLICY "Admins and mentors can delete modules"
  ON learning_modules FOR DELETE TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor'));

-- ============================================================
-- If you still get the RLS error after running this, the next most likely
-- cause is that your own profile's role isn't actually 'admin' in the
-- database. Check with:
--
--   SELECT id, email, role FROM profiles WHERE id = auth.uid();
--
-- and fix it with (replace the email):
--
--   UPDATE profiles SET role = 'admin' WHERE email = 'you@example.com';
-- ============================================================
