import { supabase } from './supabase'
import { logActivity } from '@/utils/activityLog'
import type { Project, ProjectSubmission, MentorFeedback } from '@/types'

// Narrow builder bypasses `never[]` insert inference for project_submissions
type PsInsert = { project_id: string; student_id: string; submission_content: string; file_url: string | null }
type PsBuilder = {
  insert(data: PsInsert): { select(): { single(): Promise<{ data: unknown; error: Error | null }> } }
}
function psTable() { return supabase.from('project_submissions') as unknown as PsBuilder }

export async function getAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_active', true)
    .order('due_date', { ascending: true })
  if (error) throw error
  return (data ?? []) as unknown as Project[]
}

export async function getProjectById(id: string): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as unknown as Project
}

export async function getStudentSubmissions(studentId: string): Promise<ProjectSubmission[]> {
  const { data, error } = await supabase
    .from('project_submissions')
    .select('*')
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as ProjectSubmission[]
}

export async function getSubmissionForProject(
  projectId: string,
  studentId: string,
): Promise<ProjectSubmission | null> {
  const { data } = await supabase
    .from('project_submissions')
    .select('*')
    .eq('project_id', projectId)
    .eq('student_id', studentId)
    .single()
  return (data ?? null) as unknown as ProjectSubmission | null
}

export async function getMentorFeedback(submissionId: string): Promise<MentorFeedback | null> {
  const { data } = await supabase
    .from('mentor_feedback')
    .select('*')
    .eq('submission_id', submissionId)
    .single()
  return (data ?? null) as unknown as MentorFeedback | null
}

export async function uploadProjectFile(
  file: File,
  studentId: string,
  projectId: string,
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${studentId}/${projectId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('project-files').upload(path, file)
  if (error) throw error
  const { data } = await supabase.storage.from('project-files').createSignedUrl(path, 60 * 60 * 24)
  return data?.signedUrl ?? path
}

export async function submitProject(
  projectId: string,
  studentId: string,
  content: string,
  fileUrl?: string,
): Promise<ProjectSubmission> {
  const { data, error } = await psTable()
    .insert({ project_id: projectId, student_id: studentId, submission_content: content, file_url: fileUrl ?? null })
    .select()
    .single()
  if (error) throw error
  await logActivity(studentId, 'project_submitted', `Submitted project ${projectId}`)
  return data as unknown as ProjectSubmission
}
