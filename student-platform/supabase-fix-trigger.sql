-- ============================================================
-- Fix: robust handle_new_user trigger + missing INSERT policy
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Rewrite trigger to never block auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role      user_role := 'student';
  v_full_name TEXT      := '';
BEGIN
  -- Safely cast role from metadata (ignore bad values)
  BEGIN
    IF (NEW.raw_user_meta_data->>'role') IS NOT NULL
       AND (NEW.raw_user_meta_data->>'role') <> '' THEN
      v_role := (NEW.raw_user_meta_data->>'role')::user_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_role := 'student';
  END;

  v_full_name := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), '');

  -- ON CONFLICT DO NOTHING catches ALL unique violations (id AND email)
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, v_full_name, v_role)
  ON CONFLICT DO NOTHING;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Never block signup — log the error and continue
  RAISE LOG 'handle_new_user error for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger (in case it was dropped)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. Add missing INSERT policy so authenticated users can create their own profile
--    (needed as a fallback when trigger fires before session is established)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
