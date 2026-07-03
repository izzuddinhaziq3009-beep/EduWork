import { supabase } from './supabase'
import type { IndependentProject } from '@/types'

// Narrow builder bypasses Supabase's `never` insert/update inference for independent_projects
type IpInsert = { student_id: string; title: string; description: string; status: string; image_url?: string | null }
type IpUpdate = Partial<{ status: string; github_url: string | null; image_url: string | null; completed_at: string; title: string; description: string }>
type EqOne = { eq(c: string, v: string): Promise<{ error: Error | null }> }
type IpBuilder = {
  insert(d: IpInsert): { select(): { single(): Promise<{ data: unknown; error: Error | null }> } }
  update(d: IpUpdate): EqOne
  delete(): EqOne
}
function ipTable() { return supabase.from('independent_projects') as unknown as IpBuilder }

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
  payload: { title: string; description: string; image_url?: string | null },
): Promise<IndependentProject> {
  const { data, error } = await ipTable()
    .insert({ student_id: studentId, ...payload, status: 'in_progress' })
    .select().single()
  if (error) throw error
  return data as unknown as IndependentProject
}

export async function submitIndependentProject(
  projectId: string,
  githubUrl?: string,
): Promise<void> {
  const { error } = await ipTable().update({ status: 'submitted', github_url: githubUrl ?? null }).eq('id', projectId)
  if (error) throw error
}

export async function markIndependentProjectCompleted(projectId: string): Promise<void> {
  const { error } = await ipTable().update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', projectId)
  if (error) throw error
}

export async function updateIndependentProject(
  projectId: string,
  payload: { title?: string; description?: string; github_url?: string | null; image_url?: string | null },
): Promise<void> {
  const { error } = await ipTable().update(payload).eq('id', projectId)
  if (error) throw error
}

export async function deleteIndependentProject(projectId: string): Promise<void> {
  const { error } = await ipTable().delete().eq('id', projectId)
  if (error) throw error
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5MB

export async function uploadIndependentProjectImage(studentId: string, file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Only JPG, PNG, or WEBP images are allowed.')
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Image must be less than 5MB.')
  }
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${studentId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('independent-project-images').upload(path, file)
  if (error) throw new Error(`Image upload failed: ${error.message}`)
  const { data } = supabase.storage.from('independent-project-images').getPublicUrl(path)
  return data.publicUrl
}

// Public showcase — completed projects by all students, with author display names
export async function getAvailableIndependentProjects(): Promise<IndependentProject[]> {
  const { data, error } = await supabase
    .from('independent_projects')
    .select('*')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(50)
  if (error) throw error

  const projects = (data ?? []) as unknown as IndependentProject[]
  if (projects.length === 0) return projects

  // Batch-fetch display names for all unique authors
  const studentIds = [...new Set(projects.map(p => p.student_id))]
  const { data: profileRows } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', studentIds)

  const nameMap = Object.fromEntries(
    ((profileRows ?? []) as unknown as Array<{ id: string; full_name: string }>)
      .map(p => [p.id, p.full_name]),
  )
  return projects.map(p => ({ ...p, author_name: nameMap[p.student_id] ?? null }))
}
