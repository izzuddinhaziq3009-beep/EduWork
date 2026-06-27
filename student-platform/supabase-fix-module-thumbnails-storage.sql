-- ============================================================
-- Fix module-thumbnails storage bucket + RLS (400 on upload)
-- Safe to re-run: all statements are idempotent.
--
-- A 400 on POST .../storage/v1/object/module-thumbnails/... almost always
-- means one of:
--   1) the "module-thumbnails" bucket doesn't exist yet
--      (supabase-module-thumbnails-migration.sql was never run), or
--   2) the storage.objects RLS policy for INSERT doesn't match this user's role.
-- This script re-asserts both so it's safe to run regardless of what's
-- already in place.
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('module-thumbnails', 'module-thumbnails', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Module thumbnails are publicly accessible"      ON storage.objects;
DROP POLICY IF EXISTS "Admins and mentors upload module thumbnails"    ON storage.objects;
DROP POLICY IF EXISTS "Admins and mentors delete module thumbnails"    ON storage.objects;
DROP POLICY IF EXISTS "Admins and mentors update module thumbnails"    ON storage.objects;

CREATE POLICY "Module thumbnails are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'module-thumbnails');

CREATE POLICY "Admins and mentors upload module thumbnails"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'module-thumbnails'
              AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'));

CREATE POLICY "Admins and mentors update module thumbnails"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'module-thumbnails'
         AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'));

CREATE POLICY "Admins and mentors delete module thumbnails"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'module-thumbnails'
         AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'));

-- ============================================================
-- Verify the bucket exists and is public:
--   SELECT id, name, public FROM storage.buckets WHERE id = 'module-thumbnails';
--
-- If the upload still fails after this, the rewritten error message in
-- moduleService.ts's uploadModuleImage() will now show the real Supabase
-- error text (instead of a generic message) — check the browser console.
-- ============================================================
