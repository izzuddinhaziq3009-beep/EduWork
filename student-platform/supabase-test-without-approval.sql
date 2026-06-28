-- ============================================================
-- TEMPORARY isolation test #2 — same role-casting + profile insert
-- logic as before, but WITHOUT is_approved at all (this is exactly
-- the trigger as it was before the approval feature).
--
-- Test signup as a student after running this:
--   - If it WORKS -> the bug is specifically about is_approved/v_approved
--   - If it STILL FAILS -> the bug is in the role-cast or INSERT itself,
--     unrelated to the approval feature entirely
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role      user_role := 'student';
  v_full_name TEXT      := '';
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

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, v_full_name, v_role)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'handle_new_user error for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
