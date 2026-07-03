-- ─────────────────────────────────────────────────────────────────────────────
-- supabase-independent-project-images-migration.sql
-- Adds a cover image URL column to independent_projects and creates a public
-- storage bucket where each student may only write inside their own folder.
--
-- Safe to re-run: ALTER TABLE uses IF NOT EXISTS; bucket INSERT uses ON CONFLICT
-- DO NOTHING; storage policies use DROP … IF EXISTS before CREATE.
--
-- Run in the Supabase SQL editor.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Column ─────────────────────────────────────────────────────────────────

ALTER TABLE independent_projects
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ── 2. Storage bucket ─────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('independent-project-images', 'independent-project-images', true)
ON CONFLICT (id) DO NOTHING;

-- ── 3. Storage RLS policies ───────────────────────────────────────────────────
-- Objects are stored at path: <auth.uid()>/<filename>
-- (storage.foldername(name))[1] extracts the first path component (the student
-- id folder), ensuring a student can only manage files inside their own folder.

DROP POLICY IF EXISTS "Independent project images are publicly accessible"   ON storage.objects;
DROP POLICY IF EXISTS "Students upload own independent project images"        ON storage.objects;
DROP POLICY IF EXISTS "Students update own independent project images"        ON storage.objects;
DROP POLICY IF EXISTS "Students delete own independent project images"        ON storage.objects;

-- Anyone (including anonymous) may read images — needed for the public Showcase
CREATE POLICY "Independent project images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'independent-project-images');

-- A student may only upload into their own subfolder
CREATE POLICY "Students upload own independent project images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'independent-project-images'
              AND (storage.foldername(name))[1] = auth.uid()::text);

-- A student may replace (overwrite) their own images
CREATE POLICY "Students update own independent project images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'independent-project-images'
         AND (storage.foldername(name))[1] = auth.uid()::text);

-- A student may delete their own images
CREATE POLICY "Students delete own independent project images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'independent-project-images'
         AND (storage.foldername(name))[1] = auth.uid()::text);
