-- ============================================================
-- Section Quizzes — Migration
-- Safe to re-run: all statements are idempotent
-- ============================================================

-- ============================================================
-- student_section_progress: quiz_passed
-- ============================================================
ALTER TABLE student_section_progress
  ADD COLUMN IF NOT EXISTS quiz_passed BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================================
-- TABLE: quizzes (at most one per section, enforced at app level)
-- ============================================================
CREATE TABLE IF NOT EXISTS quizzes (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id            UUID NOT NULL REFERENCES module_sections(id) ON DELETE CASCADE,
  title                 VARCHAR(255) NOT NULL,
  description           TEXT,
  passing_score         INTEGER NOT NULL DEFAULT 70,
  time_limit_minutes    INTEGER,
  shuffle_questions     BOOLEAN NOT NULL DEFAULT FALSE,
  show_correct_answers  BOOLEAN NOT NULL DEFAULT TRUE,
  attempts_allowed      INTEGER NOT NULL DEFAULT 1, -- -1 = unlimited
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: quiz_questions
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id        UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  type           VARCHAR(50) NOT NULL, -- 'multiple_choice' | 'true_false' | 'short_answer'
  question_text  TEXT NOT NULL,
  description    TEXT,
  order_index    INTEGER NOT NULL DEFAULT 0,
  points         INTEGER NOT NULL DEFAULT 1,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: quiz_question_options (multiple_choice / true_false)
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_question_options (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id   UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text   TEXT NOT NULL,
  is_correct    BOOLEAN NOT NULL DEFAULT FALSE,
  order_index   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE quiz_question_options ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: quiz_question_answers (short_answer — accepted answers)
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_question_answers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id   UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  answer_text   TEXT NOT NULL,
  is_correct    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE quiz_question_answers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: student_quiz_attempts
-- ============================================================
CREATE TABLE IF NOT EXISTS student_quiz_attempts (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id             UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  score               INTEGER,
  passed              BOOLEAN,
  time_spent_seconds  INTEGER,
  attempt_number      INTEGER NOT NULL DEFAULT 1,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, quiz_id, attempt_number)
);
ALTER TABLE student_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: student_quiz_answers
-- ============================================================
CREATE TABLE IF NOT EXISTS student_quiz_answers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id      UUID NOT NULL REFERENCES student_quiz_attempts(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  student_answer  TEXT,
  is_correct      BOOLEAN,
  points_earned   INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE student_quiz_answers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- quizzes: viewable by anyone who can view the parent section; managed by admins/mentors
DROP POLICY IF EXISTS "Quizzes viewable with section"      ON quizzes;
DROP POLICY IF EXISTS "Admins and mentors manage quizzes"  ON quizzes;
CREATE POLICY "Quizzes viewable with section"
  ON quizzes FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM module_sections ms JOIN learning_modules lm ON lm.id = ms.module_id
    WHERE ms.id = section_id
    AND (lm.is_active = TRUE OR lm.created_by = auth.uid()
         OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'))
  ));
CREATE POLICY "Admins and mentors manage quizzes"
  ON quizzes FOR ALL TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'));

-- quiz_questions: viewable with parent quiz; managed by admins/mentors
DROP POLICY IF EXISTS "Questions viewable with quiz"          ON quiz_questions;
DROP POLICY IF EXISTS "Admins and mentors manage questions"   ON quiz_questions;
CREATE POLICY "Questions viewable with quiz"
  ON quiz_questions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM quizzes q WHERE q.id = quiz_id));
CREATE POLICY "Admins and mentors manage questions"
  ON quiz_questions FOR ALL TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'));

-- quiz_question_options: viewable with parent question; managed by admins/mentors
DROP POLICY IF EXISTS "Options viewable with question"        ON quiz_question_options;
DROP POLICY IF EXISTS "Admins and mentors manage options"     ON quiz_question_options;
CREATE POLICY "Options viewable with question"
  ON quiz_question_options FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM quiz_questions qq WHERE qq.id = question_id));
CREATE POLICY "Admins and mentors manage options"
  ON quiz_question_options FOR ALL TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'));

-- quiz_question_answers: viewable with parent question; managed by admins/mentors
DROP POLICY IF EXISTS "Answers viewable with question"        ON quiz_question_answers;
DROP POLICY IF EXISTS "Admins and mentors manage answers"     ON quiz_question_answers;
CREATE POLICY "Answers viewable with question"
  ON quiz_question_answers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM quiz_questions qq WHERE qq.id = question_id));
CREATE POLICY "Admins and mentors manage answers"
  ON quiz_question_answers FOR ALL TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'));

-- student_quiz_attempts: students manage/view own attempts; admins/mentors view all
DROP POLICY IF EXISTS "Students view own quiz attempts"   ON student_quiz_attempts;
DROP POLICY IF EXISTS "Students manage own quiz attempts" ON student_quiz_attempts;
CREATE POLICY "Students view own quiz attempts"
  ON student_quiz_attempts FOR SELECT TO authenticated
  USING (student_id = auth.uid()
         OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor'));
CREATE POLICY "Students manage own quiz attempts"
  ON student_quiz_attempts FOR ALL TO authenticated
  USING (student_id = auth.uid());

-- student_quiz_answers: students manage/view own answers (via attempt ownership); admins/mentors view all
DROP POLICY IF EXISTS "Students view own quiz answers"   ON student_quiz_answers;
DROP POLICY IF EXISTS "Students manage own quiz answers" ON student_quiz_answers;
CREATE POLICY "Students view own quiz answers"
  ON student_quiz_answers FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM student_quiz_attempts sa WHERE sa.id = attempt_id AND sa.student_id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','mentor')
  );
CREATE POLICY "Students manage own quiz answers"
  ON student_quiz_answers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM student_quiz_attempts sa WHERE sa.id = attempt_id AND sa.student_id = auth.uid()));
