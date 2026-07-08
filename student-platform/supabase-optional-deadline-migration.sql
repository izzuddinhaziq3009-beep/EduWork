-- Make deadline/due_date optional on industry_challenges and projects.
-- Run in the Supabase SQL Editor.

ALTER TABLE industry_challenges ALTER COLUMN deadline  DROP NOT NULL;
ALTER TABLE projects            ALTER COLUMN due_date  DROP NOT NULL;

-- Optional: open up all existing rows so nothing appears "past due".
-- Uncomment and run separately if you want to clear dates from existing data.
-- UPDATE industry_challenges SET deadline  = NULL;
-- UPDATE projects            SET due_date  = NULL;
