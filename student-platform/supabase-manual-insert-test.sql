-- Manually run the exact insert the trigger attempts, using the orphaned
-- user's real id directly via subquery (no copy-pasting the truncated UUID).
-- This runs OUTSIDE any trigger's exception handling, so if it fails,
-- Postgres will show us the real, specific error message right here.
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, 'Test User', 'mentor'
FROM auth.users
WHERE email = 'namikaze@gmail.com'
ON CONFLICT (id) DO NOTHING;
