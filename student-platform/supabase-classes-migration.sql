-- ─────────────────────────────────────────────────────────────────────────────
-- supabase-classes-migration.sql
-- Huawei-Talent-style CLASS structure.
--
-- Replaces the join_code-on-module approach from supabase-join-code-migration.sql.
-- Run this in the Supabase SQL editor. It is safe to run even if the previous
-- migration was never applied (all DROP / ALTER statements are IF EXISTS).
--
-- Prerequisites: learning_modules, profiles, mentorship_requests,
--                student_module_progress tables must already exist.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Remove the previous join-code-on-module artifacts (safe if not run) ──

ALTER TABLE learning_modules DROP COLUMN IF EXISTS join_code;
DROP FUNCTION IF EXISTS set_module_join_code(uuid, text);
DROP FUNCTION IF EXISTS redeem_module_code(text);

-- ── 2. Core tables ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS classes (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id  UUID         NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
  mentor_id  UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       VARCHAR(120) NOT NULL,
  join_code  VARCHAR(12)  UNIQUE NOT NULL,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_enrollments (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id   UUID        NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- ── 3. Row-level security ─────────────────────────────────────────────────────

ALTER TABLE classes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;

-- Mentors: full control over classes they own
CREATE POLICY "Mentors manage own classes"
  ON classes FOR ALL
  USING     (mentor_id = auth.uid())
  WITH CHECK (mentor_id = auth.uid());

-- Students: may only read classes they are enrolled in.
-- No direct code enumeration — code lookup happens only inside the RPC.
CREATE POLICY "Students view enrolled classes"
  ON classes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM class_enrollments
      WHERE class_id = classes.id AND student_id = auth.uid()
    )
  );

-- Mentors: read rosters for classes they own.
-- Uses class_mentor_id() (SECURITY DEFINER) to avoid the indirect RLS cycle
-- that would otherwise arise from classes ↔ class_enrollments cross-referencing.
CREATE POLICY "Mentors view class rosters"
  ON class_enrollments FOR SELECT
  USING (class_mentor_id(class_id) = auth.uid());

-- Students: read their own enrollment rows
CREATE POLICY "Students view own enrollments"
  ON class_enrollments FOR SELECT
  USING (student_id = auth.uid());

-- ── 4. Helpers ────────────────────────────────────────────────────────────────

-- Returns the mentor_id for a class without going through classes RLS.
-- Used by the class_enrollments policy to avoid an indirect RLS recursion:
--   classes policy → subquery on class_enrollments
--   class_enrollments policy → subquery on classes  (cycle!)
-- SECURITY DEFINER breaks the cycle by reading classes as the DB owner.
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

-- ── Random 8-character join code (no ambiguous chars 0/O/1/I) ────────────────

CREATE OR REPLACE FUNCTION generate_join_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code  TEXT := '';
  i     INT;
BEGIN
  FOR i IN 1..8 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
  END LOOP;
  RETURN code;
END;
$$;

-- ── 5. RPC: create_class (mentor only) ───────────────────────────────────────

CREATE OR REPLACE FUNCTION create_class(p_module_id UUID, p_name TEXT, p_instructions TEXT DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mentor_id UUID;
  v_code      TEXT;
  v_class_id  UUID;
BEGIN
  v_mentor_id := auth.uid();
  IF v_mentor_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_mentor_id AND role = 'mentor') THEN
    RAISE EXCEPTION 'Only mentors can create classes';
  END IF;

  LOOP
    v_code := generate_join_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM classes WHERE join_code = v_code);
  END LOOP;

  INSERT INTO classes (module_id, mentor_id, name, join_code, instructions)
  VALUES (p_module_id, v_mentor_id, p_name, v_code, p_instructions)
  RETURNING id INTO v_class_id;

  RETURN json_build_object(
    'id',           v_class_id::TEXT,
    'module_id',    p_module_id::TEXT,
    'mentor_id',    v_mentor_id::TEXT,
    'name',         p_name,
    'join_code',    v_code,
    'is_active',    TRUE,
    'created_at',   NOW()::TEXT,
    'instructions', p_instructions
  );
END;
$$;

-- ── 6. RPC: reset_class_code (mentor only) ───────────────────────────────────

CREATE OR REPLACE FUNCTION reset_class_code(p_class_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  LOOP
    v_code := generate_join_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM classes WHERE join_code = v_code);
  END LOOP;

  UPDATE classes SET join_code = v_code
  WHERE id = p_class_id AND mentor_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Class not found or permission denied';
  END IF;

  RETURN v_code;
END;
$$;

-- ── 7. RPC: redeem_class_code (student) ──────────────────────────────────────

CREATE OR REPLACE FUNCTION redeem_class_code(p_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_class_id     UUID;
  v_class_name   TEXT;
  v_module_id    UUID;
  v_module_title TEXT;
  v_mentor_id    UUID;
  v_student_id   UUID;
BEGIN
  v_student_id := auth.uid();
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT c.id, c.name, c.module_id, lm.title, c.mentor_id
  INTO   v_class_id, v_class_name, v_module_id, v_module_title, v_mentor_id
  FROM   classes c
  JOIN   learning_modules lm ON lm.id = c.module_id
  WHERE  LOWER(c.join_code) = LOWER(p_code)
    AND  c.is_active = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or inactive class code';
  END IF;

  -- Enroll student in the class
  INSERT INTO class_enrollments (class_id, student_id)
  VALUES (v_class_id, v_student_id)
  ON CONFLICT (class_id, student_id) DO NOTHING;

  -- Enroll student in the module
  INSERT INTO student_module_progress (student_id, module_id, progress, completed, last_accessed)
  VALUES (v_student_id, v_module_id, 0, FALSE, NOW())
  ON CONFLICT (student_id, module_id) DO NOTHING;

  -- Auto-assign mentor (idempotent: only inserts when no accepted relationship exists)
  INSERT INTO mentorship_requests (student_id, mentor_id, status, message)
  SELECT v_student_id, v_mentor_id, 'accepted', 'Joined class ' || v_class_name
  WHERE NOT EXISTS (
    SELECT 1 FROM mentorship_requests
    WHERE student_id = v_student_id
      AND mentor_id  = v_mentor_id
      AND status     = 'accepted'
  );

  RETURN json_build_object(
    'class_id',     v_class_id::TEXT,
    'class_name',   v_class_name,
    'module_id',    v_module_id::TEXT,
    'module_title', v_module_title,
    'mentor_id',    v_mentor_id::TEXT
  );
END;
$$;

-- ── 8. Permissions ────────────────────────────────────────────────────────────

GRANT EXECUTE ON FUNCTION create_class(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_class_code(UUID)   TO authenticated;
GRANT EXECUTE ON FUNCTION redeem_class_code(TEXT)  TO authenticated;
