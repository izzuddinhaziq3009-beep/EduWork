-- Add rejection tracking fields to industry_challenges
-- Run in Supabase SQL Editor
ALTER TABLE industry_challenges
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS rejected_at      TIMESTAMPTZ;
