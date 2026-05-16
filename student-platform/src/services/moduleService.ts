import { supabase } from './supabase'
import type { LearningModule, StudentModuleProgress } from '@/types'

export type ProgressWithModule = StudentModuleProgress & {
  module: LearningModule
}

export async function getAllModules(): Promise<LearningModule[]> {
  const { data, error } = await supabase
    .from('learning_modules')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as LearningModule[]
}

export async function getModuleById(id: string): Promise<LearningModule> {
  const { data, error } = await supabase
    .from('learning_modules')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as unknown as LearningModule
}

export async function getStudentModuleProgress(studentId: string): Promise<StudentModuleProgress[]> {
  const { data, error } = await supabase
    .from('student_module_progress')
    .select('*')
    .eq('student_id', studentId)
  if (error) throw error
  return (data ?? []) as unknown as StudentModuleProgress[]
}

export async function getProgressForModule(
  moduleId: string,
  studentId: string,
): Promise<StudentModuleProgress | null> {
  const { data } = await supabase
    .from('student_module_progress')
    .select('*')
    .eq('student_id', studentId)
    .eq('module_id', moduleId)
    .single()
  return (data ?? null) as unknown as StudentModuleProgress | null
}

export async function enrollInModule(moduleId: string, studentId: string): Promise<void> {
  const { error } = await supabase
    .from('student_module_progress')
    .upsert(
      { student_id: studentId, module_id: moduleId, progress: 0, completed: false, last_accessed: new Date().toISOString() },
      { onConflict: 'student_id,module_id' },
    )
  if (error) throw error
}

export async function updateProgress(moduleId: string, studentId: string, progress: number): Promise<void> {
  const { error } = await supabase
    .from('student_module_progress')
    .update({ progress, last_accessed: new Date().toISOString() })
    .eq('student_id', studentId)
    .eq('module_id', moduleId)
  if (error) throw error
}

export async function markAsCompleted(moduleId: string, studentId: string): Promise<void> {
  const { error } = await supabase
    .from('student_module_progress')
    .update({
      progress: 100,
      completed: true,
      completed_at: new Date().toISOString(),
      last_accessed: new Date().toISOString(),
    })
    .eq('student_id', studentId)
    .eq('module_id', moduleId)
  if (error) throw error
}
