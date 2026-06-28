-- ============================================================
-- TEMPORARY isolation test — replaces handle_new_user with a
-- no-op that does nothing but return NEW (no profile insert at all).
--
-- Run this, then try signing up as mentor/company again:
--   - If it STILL fails -> the problem is NOT in handle_new_user at all
--     (something else entirely is blocking auth.users inserts).
--   - If it SUCCEEDS -> the problem is definitely inside the real
--     handle_new_user logic, and no profile row will exist yet for
--     that test account (expected, since this version skips it).
--
-- Either way, tell me the result, then we restore the real function
-- with supabase-diagnose-approval-error.sql afterward.
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
