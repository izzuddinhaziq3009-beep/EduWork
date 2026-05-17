-- ============================================================
-- Company profile fields migration
-- Run this in the Supabase SQL Editor
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS company_description TEXT,
  ADD COLUMN IF NOT EXISTS company_website     VARCHAR(500),
  ADD COLUMN IF NOT EXISTS company_industry    VARCHAR(255);
