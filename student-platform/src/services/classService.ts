import { supabase } from './supabase'
import { logActivity } from '@/utils/activityLog'
import type { Profile, Class, DifficultyLevel } from '@/types'

// Bypass Supabase's generated-type overloads for SECURITY DEFINER RPCs.
type UntypedRpc = (fn: string, params?: Record<string, unknown>) => Promise<{ data: unknown; error: Error | null }>
const rpc = supabase.rpc.bind(supabase) as unknown as UntypedRpc

// Narrow builder for UPDATE — avoids Supabase's "never" inference on generic update.
type ClassUpdate = { is_active: boolean }
type ClassUpdateBuilder = {
  update(d: ClassUpdate): { eq(col: string, val: string): Promise<{ error: Error | null }> }
}
function classUpdateTable() { return supabase.from('classes') as unknown as ClassUpdateBuilder }

export interface ClassWithMeta extends Class {
  module_title: string
  enrolled_count: number
}

export interface RedeemClassResult {
  classId: string
  className: string
  moduleId: string
  moduleTitle: string
  mentorId: string | null
}

export interface StudentClassRow {
  classId: string
  className: string
  moduleId: string
  moduleTitle: string
  moduleDescription: string
  difficultyLevel: DifficultyLevel
  durationHours: number
  moduleImageUrl: string | null
  moduleColor: string | null
  mentorId: string
  mentorName: string
  progress: number
  completed: boolean
  classmatesCount: number
}

export async function getStudentClasses(studentId: string): Promise<StudentClassRow[]> {
  const { data: enrollments, error: e1 } = await supabase
    .from('class_enrollments')
    .select('class_id')
    .eq('student_id', studentId)
  if (e1) throw e1

  const classIds = ((enrollments ?? []) as { class_id: string }[]).map(r => r.class_id)
  if (!classIds.length) return []

  const { data: classes, error: e2 } = await supabase
    .from('classes')
    .select('id, name, module_id, mentor_id')
    .in('id', classIds)
    .eq('is_active', true)
  if (e2) throw e2

  const activeClasses = (classes ?? []) as { id: string; name: string; module_id: string; mentor_id: string }[]
  if (!activeClasses.length) return []

  const moduleIds = [...new Set(activeClasses.map(c => c.module_id))]
  const mentorIds = [...new Set(activeClasses.map(c => c.mentor_id))]

  type ModuleRow = {
    id: string; title: string; description: string
    difficulty_level: string; duration_hours: number
    module_image_url?: string | null; module_color?: string | null
  }
  const { data: modules } = await supabase
    .from('learning_modules')
    .select('id, title, description, difficulty_level, duration_hours, module_image_url, module_color')
    .in('id', moduleIds)
  const moduleMap = Object.fromEntries(
    ((modules ?? []) as ModuleRow[]).map(m => [m.id, m])
  )

  const { data: mentors } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', mentorIds)
  const mentorMap = Object.fromEntries(
    ((mentors ?? []) as { id: string; full_name: string }[]).map(m => [m.id, m.full_name])
  )

  const { data: progressRows } = await supabase
    .from('student_module_progress')
    .select('module_id, progress, completed')
    .eq('student_id', studentId)
    .in('module_id', moduleIds)
  const progressMap = Object.fromEntries(
    ((progressRows ?? []) as { module_id: string; progress: number; completed: boolean }[])
      .map(p => [p.module_id, p])
  )

  // Enrollment counts. Due to RLS (students view own rows only), this reflects
  // the count visible to the student. A mentor-scoped count policy would return
  // the full class size without any code change here.
  const { data: allEnrollments } = await supabase
    .from('class_enrollments')
    .select('class_id')
    .in('class_id', activeClasses.map(c => c.id))
  const countMap: Record<string, number> = {}
  for (const row of ((allEnrollments ?? []) as { class_id: string }[])) {
    countMap[row.class_id] = (countMap[row.class_id] ?? 0) + 1
  }

  return activeClasses.map(c => {
    const mod = moduleMap[c.module_id]
    return {
      classId:           c.id,
      className:         c.name,
      moduleId:          c.module_id,
      moduleTitle:       mod?.title            ?? 'Unknown Module',
      moduleDescription: mod?.description      ?? '',
      difficultyLevel:   (mod?.difficulty_level ?? 'beginner') as DifficultyLevel,
      durationHours:     mod?.duration_hours    ?? 0,
      moduleImageUrl:    mod?.module_image_url  ?? null,
      moduleColor:       mod?.module_color      ?? null,
      mentorId:          c.mentor_id,
      mentorName:        mentorMap[c.mentor_id] ?? 'Unknown Mentor',
      progress:          progressMap[c.module_id]?.progress  ?? 0,
      completed:         progressMap[c.module_id]?.completed ?? false,
      classmatesCount:   countMap[c.id] ?? 0,
    }
  })
}

export async function getMentorClasses(mentorId: string): Promise<ClassWithMeta[]> {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('mentor_id', mentorId)
    .order('created_at', { ascending: false })
  if (error) throw error
  const classes = (data ?? []) as unknown as Class[]
  if (!classes.length) return []

  const moduleIds = [...new Set(classes.map(c => c.module_id))]
  const { data: modules } = await supabase
    .from('learning_modules')
    .select('id, title')
    .in('id', moduleIds)
  const moduleMap = Object.fromEntries(
    ((modules ?? []) as { id: string; title: string }[]).map(m => [m.id, m.title])
  )

  const classIds = classes.map(c => c.id)
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('class_id')
    .in('class_id', classIds)
  const countMap: Record<string, number> = {}
  for (const row of (enrollments ?? []) as { class_id: string }[]) {
    countMap[row.class_id] = (countMap[row.class_id] ?? 0) + 1
  }

  return classes.map(c => ({
    ...c,
    module_title: moduleMap[c.module_id] ?? 'Unknown Module',
    enrolled_count: countMap[c.id] ?? 0,
  }))
}

export async function createClass(moduleId: string, name: string): Promise<Class> {
  const { data, error } = await rpc('create_class', { p_module_id: moduleId, p_name: name })
  if (error) throw error
  return data as unknown as Class
}

export async function resetClassCode(classId: string): Promise<string> {
  const { data, error } = await rpc('reset_class_code', { p_class_id: classId })
  if (error) throw error
  return data as string
}

export async function deactivateClass(classId: string): Promise<void> {
  const { error } = await classUpdateTable().update({ is_active: false }).eq('id', classId)
  if (error) throw error
}

export interface RosterEntry {
  student: Profile
  progress: number
  completed: boolean
}

export async function getClassRoster(classId: string): Promise<RosterEntry[]> {
  // 1. look up this class's module_id
  const { data: classRows, error: e0 } = await supabase
    .from('classes')
    .select('module_id')
    .eq('id', classId)
  if (e0) throw e0
  const moduleId = ((classRows ?? []) as { module_id: string }[])[0]?.module_id
  if (!moduleId) return []

  // 2. get enrolled student IDs
  const { data: enrollments, error: e1 } = await supabase
    .from('class_enrollments')
    .select('student_id')
    .eq('class_id', classId)
  if (e1) throw e1
  const studentIds = ((enrollments ?? []) as { student_id: string }[]).map(r => r.student_id)
  if (!studentIds.length) return []

  // 3. get student profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', studentIds)

  // 4. get each student's progress on this module
  const { data: progressRows } = await supabase
    .from('student_module_progress')
    .select('student_id, progress, completed')
    .eq('module_id', moduleId)
    .in('student_id', studentIds)
  const progressMap = Object.fromEntries(
    ((progressRows ?? []) as { student_id: string; progress: number; completed: boolean }[])
      .map(p => [p.student_id, p])
  )

  return ((profiles ?? []) as unknown as Profile[]).map(student => ({
    student,
    progress:  progressMap[student.id]?.progress  ?? 0,
    completed: progressMap[student.id]?.completed ?? false,
  }))
}

export async function redeemClassCode(code: string, studentId: string): Promise<RedeemClassResult> {
  const { data, error } = await rpc('redeem_class_code', { p_code: code })
  if (error) throw error
  const row = data as {
    class_id: string
    class_name: string
    module_id: string
    module_title: string
    mentor_id: string | null
  }
  await logActivity(studentId, 'class_joined', `Joined class "${row.class_name}"`)
  return {
    classId:     row.class_id,
    className:   row.class_name,
    moduleId:    row.module_id,
    moduleTitle: row.module_title,
    mentorId:    row.mentor_id ?? null,
  }
}
