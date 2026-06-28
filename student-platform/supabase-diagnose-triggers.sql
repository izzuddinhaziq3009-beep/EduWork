-- ============================================================
-- Direct diagnostic — bypasses the log UI entirely.
-- Run all three and paste back the full results.
-- ============================================================

-- 1) Does is_approved exist with the right shape?
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'is_approved';

-- 2) ALL triggers currently on auth.users (in case something other than
--    handle_new_user is also firing and failing)
SELECT tgname AS trigger_name, tgenabled AS enabled,
       pg_get_triggerdef(oid) AS definition
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass AND NOT tgisinternal;

-- 3) Does profiles have a unique/primary key constraint? (needed for ON CONFLICT)
SELECT conname, contype FROM pg_constraint WHERE conrelid = 'public.profiles'::regclass;
