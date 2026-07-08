-- Grants admins the ability to delete any independent project.
-- Run in the Supabase SQL editor after supabase-independent-showcase-migration.sql.
DROP POLICY IF EXISTS "Admins delete any independent project" ON independent_projects;
CREATE POLICY "Admins delete any independent project"
  ON independent_projects FOR DELETE TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
