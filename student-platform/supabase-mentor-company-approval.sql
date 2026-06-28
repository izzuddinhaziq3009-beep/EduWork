-- ============================================================
-- Mentor/company accounts require admin approval before login.
-- Students (and admins) are unaffected — approved by default.
-- Safe to re-run.
-- ============================================================

-- New column. DEFAULT true backfills ALL existing rows (students, mentors,
-- companies, admins already in the table) as approved, so no existing
-- account gets locked out by this migration.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT true;

-- Update the signup trigger: self-signups with role mentor/company start
-- unapproved. (Accounts created directly by an admin via the admin panel
-- are explicitly re-approved by the app right after creation — see
-- adminService.ts's createUser — so this only affects public self-signup.)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role      user_role := 'student';
  v_full_name TEXT      := '';
  v_approved  BOOLEAN   := true;
BEGIN
  BEGIN
    IF (NEW.raw_user_meta_data->>'role') IS NOT NULL
       AND (NEW.raw_user_meta_data->>'role') <> '' THEN
      v_role := (NEW.raw_user_meta_data->>'role')::user_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_role := 'student';
  END;

  v_full_name := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), '');

  IF v_role IN ('mentor', 'company') THEN
    v_approved := false;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, is_approved)
  VALUES (NEW.id, NEW.email, v_full_name, v_role, v_approved)
  ON CONFLICT DO NOTHING;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'handle_new_user error for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Verify: should show is_approved = true for every existing row,
-- and false only for brand-new pending mentor/company signups going forward.
--   SELECT email, role, is_approved FROM profiles ORDER BY created_at DESC;
-- ============================================================
