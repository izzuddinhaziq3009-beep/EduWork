-- ============================================================
-- Student Experience Development Platform — Supabase Setup
-- Run this entire script in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('student', 'mentor', 'admin', 'company');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE submission_status AS ENUM ('submitted', 'reviewing', 'approved', 'revision_requested');
CREATE TYPE mentorship_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE feedback_status AS ENUM ('approved', 'revision_requested');
CREATE TYPE portfolio_item_type AS ENUM ('module', 'project', 'challenge', 'independent_project');
CREATE TYPE independent_project_status AS ENUM ('in_progress', 'submitted', 'completed');
CREATE TYPE challenge_submission_status AS ENUM ('submitted', 'reviewing', 'feedback_given', 'completed');
CREATE TYPE reviewer_type AS ENUM ('company', 'mentor', 'admin');
CREATE TYPE notification_type AS ENUM ('feedback', 'mentorship', 'challenge', 'project', 'system');

-- ============================================================
-- TABLE 1: profiles
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  email VARCHAR(255) NOT NULL UNIQUE,
  avatar_url VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TABLE 2: learning_modules
-- ============================================================
CREATE TABLE learning_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  difficulty_level difficulty_level NOT NULL,
  duration_hours INTEGER NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE 3: student_module_progress
-- ============================================================
CREATE TABLE student_module_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  last_accessed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, module_id)
);

ALTER TABLE student_module_progress ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE 4: projects
-- ============================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  module_id UUID REFERENCES learning_modules(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE 5: project_submissions
-- ============================================================
CREATE TABLE project_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  submission_content TEXT NOT NULL,
  file_url VARCHAR(500),
  status submission_status NOT NULL DEFAULT 'submitted',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE project_submissions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE 6: mentorship_requests
-- ============================================================
CREATE TABLE mentorship_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status mentorship_status NOT NULL DEFAULT 'pending',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE 7: mentor_feedback
-- ============================================================
CREATE TABLE mentor_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES project_submissions(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  status feedback_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE mentor_feedback ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE 8: messages
-- ============================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE 9: digital_portfolio
-- ============================================================
CREATE TABLE digital_portfolio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  title VARCHAR(255) NOT NULL,
  bio TEXT NOT NULL,
  skills TEXT[] NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  public_url VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE digital_portfolio ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE 10: portfolio_items
-- ============================================================
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES digital_portfolio(id) ON DELETE CASCADE,
  type portfolio_item_type NOT NULL,
  reference_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE 11: independent_projects
-- ============================================================
CREATE TABLE independent_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status independent_project_status NOT NULL DEFAULT 'in_progress',
  github_url VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE independent_projects ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE 12: industry_challenges
-- ============================================================
CREATE TABLE industry_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  difficulty_level difficulty_level NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE industry_challenges ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE 13: challenge_submissions
-- ============================================================
CREATE TABLE challenge_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES industry_challenges(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  github_url VARCHAR(500) NOT NULL,
  github_username VARCHAR(255) NOT NULL,
  github_repo_name VARCHAR(255) NOT NULL,
  github_verified BOOLEAN NOT NULL DEFAULT FALSE,
  github_commit_count INTEGER NOT NULL DEFAULT 0,
  readme_exists BOOLEAN NOT NULL DEFAULT FALSE,
  privacy_file_exists BOOLEAN NOT NULL DEFAULT FALSE,
  status challenge_submission_status NOT NULL DEFAULT 'submitted',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE 14: challenge_feedback
-- ============================================================
CREATE TABLE challenge_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES challenge_submissions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_type reviewer_type NOT NULL,
  feedback_text TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE challenge_feedback ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE 15: notifications
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE 16: activity_logs
-- ============================================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- profiles: readable by authenticated users, writable only by owner
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins have full profile access"
  ON profiles FOR ALL TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- learning_modules
CREATE POLICY "Active modules viewable by authenticated users"
  ON learning_modules FOR SELECT TO authenticated
  USING (is_active = TRUE OR created_by = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor'));
CREATE POLICY "Admins and mentors can manage modules"
  ON learning_modules FOR ALL TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor'));

-- student_module_progress
CREATE POLICY "Students view own progress"
  ON student_module_progress FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor'));
CREATE POLICY "Students manage own progress"
  ON student_module_progress FOR ALL TO authenticated
  USING (student_id = auth.uid());

-- projects
CREATE POLICY "Active projects viewable by authenticated users"
  ON projects FOR SELECT TO authenticated
  USING (is_active = TRUE OR created_by = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins and mentors manage projects"
  ON projects FOR ALL TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor'));

-- project_submissions
CREATE POLICY "Students view own submissions"
  ON project_submissions FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor'));
CREATE POLICY "Students create submissions"
  ON project_submissions FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students update own submissions"
  ON project_submissions FOR UPDATE TO authenticated
  USING (student_id = auth.uid() AND status = 'submitted');

-- mentorship_requests
CREATE POLICY "Users view their mentorship requests"
  ON mentorship_requests FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR mentor_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Students create mentorship requests"
  ON mentorship_requests FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "Mentors update mentorship requests"
  ON mentorship_requests FOR UPDATE TO authenticated
  USING (mentor_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- mentor_feedback
CREATE POLICY "Involved parties view mentor feedback"
  ON mentor_feedback FOR SELECT TO authenticated
  USING (mentor_id = auth.uid() OR student_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Mentors create feedback"
  ON mentor_feedback FOR INSERT TO authenticated
  WITH CHECK (mentor_id = auth.uid() AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'mentor');

-- messages
CREATE POLICY "Users view own messages"
  ON messages FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Users send messages"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users mark messages as read"
  ON messages FOR UPDATE TO authenticated
  USING (receiver_id = auth.uid());

-- digital_portfolio
CREATE POLICY "Public portfolios are viewable by all"
  ON digital_portfolio FOR SELECT
  USING (is_public = TRUE OR student_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor', 'company'));
CREATE POLICY "Students manage own portfolio"
  ON digital_portfolio FOR ALL TO authenticated
  USING (student_id = auth.uid());

-- portfolio_items
CREATE POLICY "Portfolio items viewable with portfolio"
  ON portfolio_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM digital_portfolio dp
    WHERE dp.id = portfolio_id AND (dp.is_public = TRUE OR dp.student_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor', 'company'))
  ));
CREATE POLICY "Students manage own portfolio items"
  ON portfolio_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM digital_portfolio dp WHERE dp.id = portfolio_id AND dp.student_id = auth.uid()));

-- independent_projects
CREATE POLICY "Students view own independent projects"
  ON independent_projects FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor'));
CREATE POLICY "Students manage own independent projects"
  ON independent_projects FOR ALL TO authenticated
  USING (student_id = auth.uid());

-- industry_challenges
CREATE POLICY "Approved active challenges viewable by all authenticated"
  ON industry_challenges FOR SELECT TO authenticated
  USING (is_active = TRUE AND is_approved = TRUE OR company_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Companies manage own challenges"
  ON industry_challenges FOR ALL TO authenticated
  USING (company_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- challenge_submissions
CREATE POLICY "Students view own challenge submissions"
  ON challenge_submissions FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    OR EXISTS (SELECT 1 FROM industry_challenges ic WHERE ic.id = challenge_id AND ic.company_id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'mentor'
  );
CREATE POLICY "Students create challenge submissions"
  ON challenge_submissions FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students update own submissions"
  ON challenge_submissions FOR UPDATE TO authenticated
  USING (student_id = auth.uid());

-- challenge_feedback
CREATE POLICY "Involved parties view challenge feedback"
  ON challenge_feedback FOR SELECT TO authenticated
  USING (
    reviewer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM challenge_submissions cs WHERE cs.id = submission_id AND cs.student_id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
CREATE POLICY "Reviewers create challenge feedback"
  ON challenge_feedback FOR INSERT TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('company', 'mentor', 'admin')
  );

-- notifications
CREATE POLICY "Users view own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "System inserts notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'mentor', 'company') OR user_id = auth.uid());
CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- activity_logs
CREATE POLICY "Users view own activity logs"
  ON activity_logs FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "System inserts activity logs"
  ON activity_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- ENABLE REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE mentor_feedback;
ALTER PUBLICATION supabase_realtime ADD TABLE challenge_feedback;
ALTER PUBLICATION supabase_realtime ADD TABLE mentorship_requests;

-- ============================================================
-- STORAGE BUCKETS (run in Supabase Dashboard > Storage, or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-assets', 'portfolio-assets', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- ============================================================

-- Storage RLS for avatars bucket (public read, owner write)
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage RLS for project-files (owner access)
CREATE POLICY "Students can upload project files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Students can view own project files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'project-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage RLS for portfolio-assets
CREATE POLICY "Users can upload portfolio assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio-assets' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Portfolio assets viewable by authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'portfolio-assets');
