-- ============================================================
-- Public landing page support
-- Safe to re-run: all statements are idempotent
-- ============================================================

-- ============================================================
-- Allow anonymous (logged-out) visitors to browse active modules.
-- The existing "Active modules viewable by authenticated users" policy
-- stays untouched — this just adds an equivalent policy for the `anon` role.
-- ============================================================
DROP POLICY IF EXISTS "Active modules viewable by anonymous visitors" ON learning_modules;
CREATE POLICY "Active modules viewable by anonymous visitors"
  ON learning_modules FOR SELECT TO anon
  USING (is_active = TRUE);

-- ============================================================
-- Aggregate-only stats for the landing page. These are SECURITY DEFINER
-- functions that return counts ONLY — never individual student rows — so
-- granting anon access here does not expose per-student progress/enrollment
-- data (student_module_progress / profiles stay un-readable by anon directly).
-- ============================================================
CREATE OR REPLACE FUNCTION get_landing_stats()
RETURNS TABLE(total_students bigint, total_modules bigint, total_enrollments bigint)
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT
    (SELECT COUNT(*) FROM profiles WHERE role = 'student'),
    (SELECT COUNT(*) FROM learning_modules WHERE is_active = TRUE),
    (SELECT COUNT(*) FROM student_module_progress);
$$;
GRANT EXECUTE ON FUNCTION get_landing_stats() TO anon, authenticated;

CREATE OR REPLACE FUNCTION get_module_learner_counts()
RETURNS TABLE(module_id uuid, learner_count bigint)
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT module_id, COUNT(DISTINCT student_id)
  FROM student_module_progress
  GROUP BY module_id;
$$;
GRANT EXECUTE ON FUNCTION get_module_learner_counts() TO anon, authenticated;
