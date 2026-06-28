-- Check for triggers on the profiles table itself (separate from the
-- auth.users trigger we already checked). Run this alone.
SELECT tgname AS trigger_name, tgenabled AS enabled,
       pg_get_triggerdef(oid) AS definition
FROM pg_trigger
WHERE tgrelid = 'public.profiles'::regclass AND NOT tgisinternal;
