-- ============================================================
-- Module Sections & Rich Content — Migration
-- Safe to re-run: all statements are idempotent
-- ============================================================

-- ============================================================
-- learning_modules: module_type + simple_content
-- ============================================================
ALTER TABLE learning_modules
  ADD COLUMN IF NOT EXISTS module_type VARCHAR(50) NOT NULL DEFAULT 'simple',
  ADD COLUMN IF NOT EXISTS simple_content TEXT;

UPDATE learning_modules SET module_type = 'simple' WHERE module_type IS NULL;

-- ============================================================
-- TABLE: module_sections
-- ============================================================
CREATE TABLE IF NOT EXISTS module_sections (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id    UUID NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  order_index  INTEGER NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE module_sections ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: section_content_items
-- ============================================================
CREATE TABLE IF NOT EXISTS section_content_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id   UUID NOT NULL REFERENCES module_sections(id) ON DELETE CASCADE,
  type         VARCHAR(50) NOT NULL, -- 'text' | 'video' | 'pdf' | 'image'
  title        VARCHAR(255) NOT NULL,
  content      TEXT,        -- for type = 'text'
  file_url     VARCHAR(500),-- for type = 'video' | 'pdf' | 'image'
  description  TEXT,
  order_index  INTEGER NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE section_content_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: student_section_progress
-- ============================================================
CREATE TABLE IF NOT EXISTS student_section_progress (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  section_id   UUID NOT NULL REFERENCES module_sections(id) ON DELETE CASCADE,
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, section_id)
);
ALTER TABLE student_section_progress ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- module_sections: viewable by anyone who can view the parent module; managed by admins/mentors
DROP POLICY IF EXISTS "Sections viewable with module"        ON module_sections;
DROP POLICY IF EXISTS "Admins and mentors manage sections"   ON module_sections;
CREATE POLICY "Sections viewable with module"
  ON module_sections FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM learning_modules lm WHERE lm.id = module_id
    AND (lm.is_active = TRUE OR lm.created_by = auth.uid()
         OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'))
  ));
CREATE POLICY "Admins and mentors manage sections"
  ON module_sections FOR ALL TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'));

-- section_content_items: viewable with parent section; managed by admins/mentors
DROP POLICY IF EXISTS "Content items viewable with section"      ON section_content_items;
DROP POLICY IF EXISTS "Admins and mentors manage content items"  ON section_content_items;
CREATE POLICY "Content items viewable with section"
  ON section_content_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM module_sections ms JOIN learning_modules lm ON lm.id = ms.module_id
    WHERE ms.id = section_id
    AND (lm.is_active = TRUE OR lm.created_by = auth.uid()
         OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'))
  ));
CREATE POLICY "Admins and mentors manage content items"
  ON section_content_items FOR ALL TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'));

-- student_section_progress: students manage/view own progress; admins/mentors can view
DROP POLICY IF EXISTS "Students view own section progress"   ON student_section_progress;
DROP POLICY IF EXISTS "Students manage own section progress" ON student_section_progress;
CREATE POLICY "Students view own section progress"
  ON student_section_progress FOR SELECT TO authenticated
  USING (student_id = auth.uid()
         OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'));
CREATE POLICY "Students manage own section progress"
  ON student_section_progress FOR ALL TO authenticated
  USING (student_id = auth.uid());

-- ============================================================
-- STORAGE BUCKET for module content (video/pdf/image uploads)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('module-content', 'module-content', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Module content is publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins and mentors upload module content" ON storage.objects;

CREATE POLICY "Module content is publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'module-content');
CREATE POLICY "Admins and mentors upload module content"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'module-content'
              AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'));
