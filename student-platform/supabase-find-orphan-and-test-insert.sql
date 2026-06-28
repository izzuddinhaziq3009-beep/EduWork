-- 1) Find auth.users rows from failed signups that have no profiles row yet.
-- Run this first, alone, and look at the results.
SELECT u.id, u.email, u.created_at, u.raw_user_meta_data
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC
LIMIT 10;
