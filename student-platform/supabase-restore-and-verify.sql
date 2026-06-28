-- ============================================================
-- Restore the real handle_new_user function, then verify exactly
-- what's deployed and whether RLS could be blocking it.
-- ============================================================

-- 1) Restore the real function
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

-- 2) Confirm exactly what's deployed, character for character
SELECT pg_get_functiondef('handle_new_user'::regproc);

-- 3) Does profiles FORCE row-level security even for the table owner?
--    (If relforcerowsecurity = true, even a SECURITY DEFINER function
--    owned by the table owner is still subject to RLS policies.)
SELECT relrowsecurity, relforcerowsecurity FROM pg_class WHERE relname = 'profiles';

-- 4) Who owns the function vs who owns the table — a mismatch here
--    combined with FORCE RLS would explain a silent-to-us permission failure.
SELECT
  (SELECT rolname FROM pg_roles WHERE oid = proowner) AS function_owner
FROM pg_proc WHERE proname = 'handle_new_user';

SELECT
  (SELECT rolname FROM pg_roles WHERE oid = relowner) AS table_owner
FROM pg_class WHERE relname = 'profiles';
