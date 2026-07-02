-- SUPERSEDED — DO NOT RUN.
-- This migration added join_code to learning_modules (module-level codes).
-- That approach has been replaced by the class-based model.
-- Run supabase-classes-migration.sql instead, which also drops these artifacts.
--
-- Original file kept for reference only.

-- Module join code feature
-- Run this in Supabase SQL Editor (Dashboard › SQL Editor › New query)

-- ── Step 1: Column ────────────────────────────────────────────────────────────

ALTER TABLE learning_modules
  ADD COLUMN IF NOT EXISTS join_code VARCHAR(12) UNIQUE;

-- ── Step 2: Mentor sets / clears a join code on a module they own ─────────────
-- SECURITY DEFINER so the function runs as the DB owner; it checks
-- created_by = auth.uid() internally, so no UPDATE RLS policy on
-- learning_modules is required.

CREATE OR REPLACE FUNCTION set_module_join_code(p_module_id uuid, p_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE learning_modules
  SET join_code = p_code
  WHERE id          = p_module_id
    AND created_by  = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Module not found or you do not have permission to manage this module';
  END IF;
END;
$$;

-- ── Step 3: Student redeems a join code ──────────────────────────────────────
-- Enrolls the student in the module and auto-creates an accepted mentorship
-- with the module creator — all server-side, so no direct write access to
-- student_module_progress or mentorship_requests is granted to the student.

CREATE OR REPLACE FUNCTION redeem_module_code(p_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_module_id    UUID;
  v_module_title TEXT;
  v_mentor_id    UUID;
  v_student_id   UUID;
BEGIN
  v_student_id := auth.uid();
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Case-insensitive lookup; code must belong to an active module
  SELECT id, title, created_by
  INTO   v_module_id, v_module_title, v_mentor_id
  FROM   learning_modules
  WHERE  LOWER(join_code) = LOWER(p_code)
    AND  is_active = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or inactive module code';
  END IF;

  -- Enroll the student; silently skip if already enrolled (UNIQUE constraint)
  INSERT INTO student_module_progress (student_id, module_id, progress, completed, last_accessed)
  VALUES (v_student_id, v_module_id, 0, false, NOW())
  ON CONFLICT (student_id, module_id) DO NOTHING;

  -- Auto-assign the module creator as an accepted mentor.
  -- Only inserts when no accepted request already exists between this pair,
  -- so repeated redemptions and prior accepted requests are both handled.
  IF v_mentor_id IS NOT NULL THEN
    INSERT INTO mentorship_requests (student_id, mentor_id, status, message)
    SELECT v_student_id, v_mentor_id, 'accepted', 'Joined via module code'
    WHERE NOT EXISTS (
      SELECT 1
      FROM   mentorship_requests
      WHERE  student_id = v_student_id
        AND  mentor_id  = v_mentor_id
        AND  status     = 'accepted'
    );
  END IF;

  RETURN json_build_object(
    'module_id',    v_module_id::text,
    'module_title', v_module_title,
    'mentor_id',    v_mentor_id::text  -- NULL when module has no creator (admin-created)
  );
END;
$$;

-- ── Step 4: Grants ────────────────────────────────────────────────────────────

GRANT EXECUTE ON FUNCTION set_module_join_code(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION redeem_module_code(text)         TO authenticated;
