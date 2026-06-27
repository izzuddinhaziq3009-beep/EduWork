-- ============================================================
-- Module thumbnail image + custom card color
-- Safe to re-run: all statements are idempotent
-- ============================================================

ALTER TABLE learning_modules
  ADD COLUMN IF NOT EXISTS module_image_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS module_color VARCHAR(50);

-- ============================================================
-- STORAGE BUCKET for module thumbnails (public read, admin/mentor write)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('module-thumbnails', 'module-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Module thumbnails are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins and mentors upload module thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins and mentors delete module thumbnails" ON storage.objects;

CREATE POLICY "Module thumbnails are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'module-thumbnails');
CREATE POLICY "Admins and mentors upload module thumbnails"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'module-thumbnails'
              AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'));
CREATE POLICY "Admins and mentors delete module thumbnails"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'module-thumbnails'
         AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'));
