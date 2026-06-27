-- ============================================================
-- One-stop: show your account's role, then re-apply the
-- learning_modules RLS policies idempotently.
-- Safe to re-run.
-- ============================================================

-- ── 1) DIAGNOSTIC: find your account and its role ───────────
-- Look at the "email" column below, find your admin login email,
-- and check what "role" says for it. (auth.uid() doesn't work in
-- the SQL Editor, so this lists everyone instead of filtering to "you".)
SELECT id, email, role, created_at
FROM profiles
ORDER BY created_at DESC;

-- ── 2) RE-APPLY the RLS policies (idempotent) ────────────────
ALTER TABLE learning_modules
  ADD COLUMN IF NOT EXISTS module_image_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS module_color VARCHAR(50);

DROP POLICY IF EXISTS "Active modules viewable by authenticated users" ON learning_modules;
DROP POLICY IF EXISTS "Active modules viewable by anonymous visitors"  ON learning_modules;
DROP POLICY IF EXISTS "Admins and mentors can manage modules"          ON learning_modules;
DROP POLICY IF EXISTS "Modules viewable by authenticated users"        ON learning_modules;
DROP POLICY IF EXISTS "Admins and mentors can create modules"          ON learning_modules;
DROP POLICY IF EXISTS "Admins and mentors can update modules"          ON learning_modules;
DROP POLICY IF EXISTS "Admins and mentors can delete modules"          ON learning_modules;
DROP POLICY IF EXISTS "Admins can create modules"                      ON learning_modules;
DROP POLICY IF EXISTS "Admins can update modules"                      ON learning_modules;
DROP POLICY IF EXISTS "Admins can delete modules"                      ON learning_modules;
DROP POLICY IF EXISTS "Anyone can view active modules"                 ON learning_modules;
DROP POLICY IF EXISTS "Admins can view all modules"                    ON learning_modules;

CREATE POLICY "Modules viewable by authenticated users"
  ON learning_modules FOR SELECT TO authenticated
  USING (
    is_active = TRUE
    OR created_by = auth.uid()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor')
  );

CREATE POLICY "Active modules viewable by anonymous visitors"
  ON learning_modules FOR SELECT TO anon
  USING (is_active = TRUE);

CREATE POLICY "Admins and mentors can create modules"
  ON learning_modules FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor'));

CREATE POLICY "Admins and mentors can update modules"
  ON learning_modules FOR UPDATE TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor'))
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor'));

CREATE POLICY "Admins and mentors can delete modules"
  ON learning_modules FOR DELETE TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor'));

-- ── 3) If step 1 showed your role is NOT 'admin' or 'mentor', ──
--      uncomment the line below, replace the email, then run again:
-- UPDATE profiles SET role = 'admin' WHERE email = 'you@example.com';
