import { supabase } from './supabase'
import type { StudentModuleProgress, ProjectSubmission, LearningModule, Project } from '@/types'

export interface ModuleProgressDetail {
  progress: StudentModuleProgress
  module: LearningModule
}

export interface ProjectProgressDetail {
  submission: ProjectSubmission
  project: Project
}

export interface OverallProgress {
  totalModules: number
  completedModules: number
  totalSubmissions: number
  approvedSubmissions: number
  challengesAttempted: number
  modulesPercent: number
  projectsPercent: number
}

export async function getModuleProgressDetails(studentId: string): Promise<ModuleProgressDetail[]> {
  const { data, error } = await supabase
    .from('student_module_progress')
    .select('*, learning_modules(*)')
    .eq('student_id', studentId)
    .order('last_accessed', { ascending: false })
  if (error) throw error
  return ((data ?? []) as unknown as (StudentModuleProgress & { learning_modules: LearningModule })[]).map(row => ({
    progress: {
      id: row.id, student_id: row.student_id, module_id: row.module_id,
      progress: row.progress, completed: row.completed,
      completed_at: row.completed_at, last_accessed: row.last_accessed,
    },
    module: row.learning_modules,
  }))
}

export async function getProjectProgressDetails(studentId: string): Promise<ProjectProgressDetail[]> {
  const { data, error } = await supabase
    .from('project_submissions')
    .select('*, projects(*)')
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false })
  if (error) throw error
  return ((data ?? []) as unknown as (ProjectSubmission & { projects: Project })[]).map(row => ({
    submission: {
      id: row.id, project_id: row.project_id, student_id: row.student_id,
      submission_content: row.submission_content, file_url: row.file_url,
      status: row.status, submitted_at: row.submitted_at,
    },
    project: row.projects,
  }))
}

export async function getStudentOverallProgress(studentId: string): Promise<OverallProgress> {
  const [{ count: totalModules }, { data: progressRows }, { data: submissions }, { count: challenges }] =
    await Promise.all([
      supabase.from('learning_modules').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('student_module_progress').select('completed').eq('student_id', studentId),
      supabase.from('project_submissions').select('status').eq('student_id', studentId),
      supabase.from('challenge_submissions').select('*', { count: 'exact', head: true }).eq('student_id', studentId),
    ])

  const total = totalModules ?? 0
  const completed = (progressRows ?? []).filter((r: { completed: boolean }) => r.completed).length
  const subs = (submissions ?? []) as { status: string }[]
  const approved = subs.filter(s => s.status === 'approved').length

  return {
    totalModules: total,
    completedModules: completed,
    totalSubmissions: subs.length,
    approvedSubmissions: approved,
    challengesAttempted: challenges ?? 0,
    modulesPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
    projectsPercent: subs.length > 0 ? Math.round((approved / subs.length) * 100) : 0,
  }
}
