import { supabase } from './supabase'
import type { IndependentProject } from '@/types'

export async function getStudentIndependentProjects(studentId: string): Promise<IndependentProject[]> {
  const { data, error } = await supabase
    .from('independent_projects')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as IndependentProject[]
}

export async function getIndependentProjectById(id: string): Promise<IndependentProject> {
  const { data, error } = await supabase
    .from('independent_projects')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as unknown as IndependentProject
}

export async function createIndependentProject(
  studentId: string,
  payload: { title: string; description: string },
): Promise<IndependentProject> {
  const { data, error } = await supabase
    .from('independent_projects')
    .insert({ student_id: studentId, ...payload, status: 'in_progress' })
    .select()
    .single()
  if (error) throw error
  return data as unknown as IndependentProject
}

export async function submitIndependentProject(
  projectId: string,
  githubUrl?: string,
): Promise<void> {
  const { error } = await supabase
    .from('independent_projects')
    .update({ status: 'submitted', github_url: githubUrl ?? null })
    .eq('id', projectId)
  if (error) throw error
}

export async function markIndependentProjectCompleted(projectId: string): Promise<void> {
  const { error } = await supabase
    .from('independent_projects')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', projectId)
  if (error) throw error
}

// Public showcase — completed projects by all students
export async function getAvailableIndependentProjects(): Promise<IndependentProject[]> {
  const { data, error } = await supabase
    .from('independent_projects')
    .select('*')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []) as unknown as IndependentProject[]
}
