-- ============================================================
-- Flatten module structure: sections → module_items
-- Quizzes become standalone items (siblings of content items), not
-- nested under sections. Existing data is migrated, not discarded.
-- Safe to re-run: guarded with IF EXISTS / IF NOT EXISTS throughout.
-- ============================================================

-- ============================================================
-- NEW TABLES
-- ============================================================
CREATE TABLE IF NOT EXISTS module_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id   UUID NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
  type        VARCHAR(50) NOT NULL, -- 'content' | 'quiz'
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE module_items ENABLE ROW LEVEL SECURITY;

-- Content pieces (text/video/pdf/image) belonging to a 'content' item.
-- Extends the user-supplied shape with title/description/order_index so a
-- content item can hold several labeled, ordered pieces (e.g. "Tutorial Video"
-- then "Worksheet PDF") — matching the previous section_content_items feature set.
CREATE TABLE IF NOT EXISTS module_item_content (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id      UUID NOT NULL REFERENCES module_items(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL, -- 'text' | 'video' | 'pdf' | 'image'
  title        VARCHAR(255) NOT NULL DEFAULT '',
  description  TEXT,
  content_text TEXT,
  file_url     VARCHAR(500),
  order_index  INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE module_item_content ENABLE ROW LEVEL SECURITY;

-- Quiz configuration for a 'quiz' item (1:1). Title/description live on the
-- parent module_items row, not duplicated here.
CREATE TABLE IF NOT EXISTS module_item_quizzes (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id               UUID NOT NULL UNIQUE REFERENCES module_items(id) ON DELETE CASCADE,
  passing_score         INTEGER NOT NULL DEFAULT 70,
  time_limit_minutes    INTEGER,
  shuffle_questions     BOOLEAN NOT NULL DEFAULT FALSE,
  show_correct_answers  BOOLEAN NOT NULL DEFAULT TRUE,
  attempts_allowed      INTEGER NOT NULL DEFAULT 1, -- -1 = unlimited
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE module_item_quizzes ENABLE ROW LEVEL SECURITY;

-- Per-student progress per item (replaces student_section_progress).
CREATE TABLE IF NOT EXISTS student_item_progress (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id      UUID NOT NULL REFERENCES module_items(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  quiz_passed  BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, item_id)
);
ALTER TABLE student_item_progress ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- DATA MIGRATION (skipped automatically if module_sections doesn't exist —
-- i.e. on a fresh database that never had the old tables)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'module_sections') THEN

    -- 1) Each section becomes a content item. Reuse the same id so that
    --    section_content_items.section_id values keep pointing at the right row.
    INSERT INTO module_items (id, module_id, type, title, description, order_index, created_at)
    SELECT id, module_id, 'content', title, description, order_index * 2, created_at
    FROM module_sections
    ON CONFLICT (id) DO NOTHING;

    -- 2) Section content rows become module_item_content rows (id + item_id reused).
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'section_content_items') THEN
      INSERT INTO module_item_content (id, item_id, content_type, title, description, content_text, file_url, order_index, created_at)
      SELECT id, section_id, type, title, description, content, file_url, order_index, created_at
      FROM section_content_items
      ON CONFLICT (id) DO NOTHING;
    END IF;

    -- 3) Each quiz becomes its OWN sibling item (placed right after its old section),
    --    using a temporary correlation column to wire up module_item_quizzes.item_id.
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quizzes') THEN
      ALTER TABLE module_items ADD COLUMN IF NOT EXISTS legacy_quiz_id UUID;

      INSERT INTO module_items (module_id, type, title, description, order_index, created_at, legacy_quiz_id)
      SELECT ms.module_id, 'quiz', q.title, q.description, ms.order_index * 2 + 1, q.created_at, q.id
      FROM quizzes q
      JOIN module_sections ms ON ms.id = q.section_id;

      INSERT INTO module_item_quizzes (id, item_id, passing_score, time_limit_minutes, shuffle_questions, show_correct_answers, attempts_allowed, created_at, updated_at)
      SELECT q.id, mi.id, q.passing_score, q.time_limit_minutes, q.shuffle_questions, q.show_correct_answers, q.attempts_allowed, q.created_at, q.updated_at
      FROM quizzes q
      JOIN module_items mi ON mi.legacy_quiz_id = q.id
      ON CONFLICT (id) DO NOTHING;

      -- 4) Repoint quiz_questions / student_quiz_attempts FKs from quizzes → module_item_quizzes
      --    (ids were reused above, so the column values themselves don't need to change).
      ALTER TABLE quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_quiz_id_fkey;
      ALTER TABLE quiz_questions ADD CONSTRAINT quiz_questions_quiz_id_fkey
        FOREIGN KEY (quiz_id) REFERENCES module_item_quizzes(id) ON DELETE CASCADE;

      ALTER TABLE student_quiz_attempts DROP CONSTRAINT IF EXISTS student_quiz_attempts_quiz_id_fkey;
      ALTER TABLE student_quiz_attempts ADD CONSTRAINT student_quiz_attempts_quiz_id_fkey
        FOREIGN KEY (quiz_id) REFERENCES module_item_quizzes(id) ON DELETE CASCADE;

      -- 5) Migrate progress: split each old section-level row into a content-item row,
      --    plus a quiz-item row when that section had a quiz.
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_section_progress') THEN
        INSERT INTO student_item_progress (student_id, item_id, is_completed, quiz_passed, completed_at, created_at)
        SELECT ssp.student_id, ssp.section_id, ssp.completed, FALSE, ssp.completed_at, NOW()
        FROM student_section_progress ssp
        ON CONFLICT (student_id, item_id) DO NOTHING;

        INSERT INTO student_item_progress (student_id, item_id, is_completed, quiz_passed, completed_at, created_at)
        SELECT ssp.student_id, mi.id, ssp.quiz_passed, ssp.quiz_passed, ssp.completed_at, NOW()
        FROM student_section_progress ssp
        JOIN quizzes q ON q.section_id = ssp.section_id
        JOIN module_items mi ON mi.legacy_quiz_id = q.id
        ON CONFLICT (student_id, item_id) DO NOTHING;
      END IF;

      ALTER TABLE module_items DROP COLUMN IF EXISTS legacy_quiz_id;
    END IF;

    -- 6) Drop superseded tables now that everything has been copied forward.
    DROP TABLE IF EXISTS student_section_progress;
    DROP TABLE IF EXISTS section_content_items;
    DROP TABLE IF EXISTS quizzes CASCADE; -- quiz_questions now points at module_item_quizzes instead
    DROP TABLE IF EXISTS module_sections;

  END IF;
END $$;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- module_items: viewable by anyone who can view the parent module; managed by admins/mentors
DROP POLICY IF EXISTS "Items viewable with module"        ON module_items;
DROP POLICY IF EXISTS "Admins and mentors manage items"   ON module_items;
CREATE POLICY "Items viewable with module"
  ON module_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM learning_modules lm WHERE lm.id = module_id
    AND (lm.is_active = TRUE OR lm.created_by = auth.uid()
         OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'))
  ));
CREATE POLICY "Admins and mentors manage items"
  ON module_items FOR ALL TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'));

-- module_item_content: viewable with parent item; managed by admins/mentors
DROP POLICY IF EXISTS "Content viewable with item"            ON module_item_content;
DROP POLICY IF EXISTS "Admins and mentors manage item content" ON module_item_content;
CREATE POLICY "Content viewable with item"
  ON module_item_content FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM module_items mi JOIN learning_modules lm ON lm.id = mi.module_id
    WHERE mi.id = item_id
    AND (lm.is_active = TRUE OR lm.created_by = auth.uid()
         OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'))
  ));
CREATE POLICY "Admins and mentors manage item content"
  ON module_item_content FOR ALL TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'));

-- module_item_quizzes: viewable with parent item; managed by admins/mentors
DROP POLICY IF EXISTS "Quiz config viewable with item"            ON module_item_quizzes;
DROP POLICY IF EXISTS "Admins and mentors manage quiz config"     ON module_item_quizzes;
CREATE POLICY "Quiz config viewable with item"
  ON module_item_quizzes FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM module_items mi JOIN learning_modules lm ON lm.id = mi.module_id
    WHERE mi.id = item_id
    AND (lm.is_active = TRUE OR lm.created_by = auth.uid()
         OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'))
  ));
CREATE POLICY "Admins and mentors manage quiz config"
  ON module_item_quizzes FOR ALL TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'));

-- quiz_questions / options / answers: re-point the "viewable with quiz" check at module_item_quizzes
DROP POLICY IF EXISTS "Questions viewable with quiz" ON quiz_questions;
CREATE POLICY "Questions viewable with quiz"
  ON quiz_questions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM module_item_quizzes q WHERE q.id = quiz_id));
-- (Admin/mentor manage-all policies on quiz_questions/options/answers are unchanged — no role check involves quizzes.)

-- student_item_progress: students manage/view own progress; admins/mentors view all
DROP POLICY IF EXISTS "Students view own item progress"   ON student_item_progress;
DROP POLICY IF EXISTS "Students manage own item progress" ON student_item_progress;
CREATE POLICY "Students view own item progress"
  ON student_item_progress FOR SELECT TO authenticated
  USING (student_id = auth.uid()
         OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'));
CREATE POLICY "Students manage own item progress"
  ON student_item_progress FOR ALL TO authenticated
  USING (student_id = auth.uid());
