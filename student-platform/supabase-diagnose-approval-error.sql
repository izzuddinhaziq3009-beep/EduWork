-- ============================================================
-- Diagnose + fix "Database error saving new user" after the
-- mentor/company approval migration. Safe to re-run.
-- ============================================================

-- ── 1) DIAGNOSTIC: does is_approved actually exist, and is it NOT NULL? ─────
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'is_approved';
-- Expect: is_approved | boolean | NO | true

-- ── 2) DIAGNOSTIC: does profiles have a unique constraint? ──────────────────
-- (Needed for the trigger's bare "ON CONFLICT DO NOTHING" to be valid SQL —
-- if this returns no rows, that bare ON CONFLICT clause errors on every insert.)
SELECT conname, contype FROM pg_constraint WHERE conrelid = 'public.profiles'::regclass;
-- Expect at least one row with contype = 'p' (primary key) or 'u' (unique)

-- ── 3) Re-assert the column (idempotent, harmless if already correct) ──────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT true;

-- ── 4) Rebuild the trigger function from a known-good definition ───────────
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
  ON CONFLICT (id) DO NOTHING;

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

-- ── 5) Final verification ───────────────────────────────────────────────────
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'is_approved';
