DO $$
DECLARE
  v_meta jsonb;
  v_role user_role;
BEGIN
  SELECT raw_user_meta_data INTO v_meta FROM auth.users WHERE email = 'namikaze@gmail.com';
  RAISE NOTICE 'metadata: %', v_meta;
  v_role := (v_meta->>'role')::user_role;
  RAISE NOTICE 'role cast succeeded: %', v_role;
END $$;
