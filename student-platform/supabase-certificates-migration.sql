-- ─────────────────────────────────────────────────────────────────────────────
-- supabase-certificates-migration.sql
-- Adds certificates table and two SECURITY DEFINER RPCs:
--   issue_certificate(p_module_id)   — auto-issues once per student+module
--   get_certificate_by_code(p_code)  — public verification (no auth required)
--
-- Run in the Supabase SQL editor.
-- Prerequisites: profiles, learning_modules, student_module_progress must exist.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Certificates table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS certificates (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID        NOT NULL REFERENCES profiles(id)          ON DELETE CASCADE,
  module_id        UUID        NOT NULL REFERENCES learning_modules(id)   ON DELETE CASCADE,
  student_name     TEXT        NOT NULL,
  module_title     TEXT        NOT NULL,
  certificate_code TEXT        NOT NULL UNIQUE,
  issued_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_public        BOOLEAN     NOT NULL DEFAULT TRUE,
  UNIQUE (student_id, module_id)
);

-- ── 2. RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Students can SELECT their own certificates
DROP POLICY IF EXISTS "students_select_own_certificates" ON certificates;
CREATE POLICY "students_select_own_certificates"
  ON certificates FOR SELECT
  USING (student_id = auth.uid());

-- No direct client INSERT / UPDATE / DELETE — only via SECURITY DEFINER RPCs

-- ── 3. RPC: issue_certificate ─────────────────────────────────────────────────
-- Checks that the calling student has completed the module, then inserts a
-- certificate row (idempotent — returns the existing row on duplicate).

CREATE OR REPLACE FUNCTION issue_certificate(p_module_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id   UUID  := auth.uid();
  v_student_name TEXT;
  v_module_title TEXT;
  v_code         TEXT;
  v_cert         certificates;
BEGIN
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Guard: module must be marked complete for this student
  IF NOT EXISTS (
    SELECT 1 FROM student_module_progress
    WHERE student_id = v_student_id
      AND module_id  = p_module_id
      AND completed  = TRUE
  ) THEN
    RAISE EXCEPTION 'Module not completed';
  END IF;

  -- Idempotent: return existing certificate if one was already issued
  SELECT * INTO v_cert
    FROM certificates
   WHERE student_id = v_student_id AND module_id = p_module_id;
  IF FOUND THEN
    RETURN to_jsonb(v_cert);
  END IF;

  -- Resolve display names
  SELECT full_name INTO v_student_name FROM profiles          WHERE id = v_student_id;
  SELECT title     INTO v_module_title FROM learning_modules  WHERE id = p_module_id;

  -- Generate a human-readable unique code: EDU-<year>-<8 hex chars>
  v_code := 'EDU-' || EXTRACT(YEAR FROM NOW())::TEXT || '-'
            || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 8));

  -- Retry on the rare collision
  WHILE EXISTS (SELECT 1 FROM certificates WHERE certificate_code = v_code) LOOP
    v_code := 'EDU-' || EXTRACT(YEAR FROM NOW())::TEXT || '-'
              || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 8));
  END LOOP;

  INSERT INTO certificates (student_id, module_id, student_name, module_title, certificate_code, is_public)
  VALUES (v_student_id, p_module_id, v_student_name, v_module_title, v_code, TRUE)
  RETURNING * INTO v_cert;

  RETURN to_jsonb(v_cert);
END;
$$;

GRANT EXECUTE ON FUNCTION issue_certificate(UUID) TO authenticated;

-- ── 4. RPC: get_certificate_by_code ──────────────────────────────────────────
-- Public verification — callable by anon and authenticated users alike.
-- Returns NULL when the code doesn't exist or the certificate is private.

CREATE OR REPLACE FUNCTION get_certificate_by_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cert certificates;
BEGIN
  SELECT * INTO v_cert
    FROM certificates
   WHERE certificate_code = p_code
     AND is_public = TRUE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN to_jsonb(v_cert);
END;
$$;

GRANT EXECUTE ON FUNCTION get_certificate_by_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_certificate_by_code(TEXT) TO anon;
