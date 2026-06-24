import { supabase } from './supabase'
import { logActivity } from '@/utils/activityLog'
import type {
  LearningModule, StudentModuleProgress, ModuleItem, ModuleItemContent, StudentItemProgress,
  DifficultyLevel, ModuleType, ModuleItemType, ContentItemType,
} from '@/types'

export type ProgressWithModule = StudentModuleProgress & {
  module: LearningModule
}

// ── Narrow builders — bypass Supabase's `never` inference ──────────────────

type SmpInsert = { student_id: string; module_id: string; progress: number; completed: boolean; completed_at?: string | null; last_accessed: string }
type SmpUpdate = { progress?: number; completed?: boolean; completed_at?: string | null; last_accessed?: string }
type SmpBuilder = {
  upsert(data: SmpInsert, opts: { onConflict: string }): Promise<{ error: Error | null }>
  update(data: SmpUpdate): { eq(c: string, v: string): { eq(c: string, v: string): Promise<{ error: Error | null }> } }
}
function smpTable() { return supabase.from('student_module_progress') as unknown as SmpBuilder }

type LmInsert = {
  created_by: string; title: string; description: string; difficulty_level: DifficultyLevel
  duration_hours: number; content?: Record<string, unknown>; module_type: ModuleType; simple_content?: string | null
}
type LmUpdate = Partial<{ title: string; description: string; difficulty_level: DifficultyLevel; duration_hours: number; simple_content: string | null; is_active: boolean }>
type SelectSingle = { select(): { single(): Promise<{ data: unknown; error: Error | null }> } }
type EqOne = { eq(c: string, v: string): Promise<{ error: Error | null }> }
type LmBuilder = { insert(d: LmInsert): SelectSingle; update(d: LmUpdate): EqOne }
function lmTable() { return supabase.from('learning_modules') as unknown as LmBuilder }

type MiInsert = { module_id: string; type: ModuleItemType; title: string; description: string | null; order_index: number }
type MiUpdate = Partial<{ title: string; description: string | null; order_index: number; updated_at: string }>
type MiBuilder = { insert(d: MiInsert): SelectSingle; update(d: MiUpdate): EqOne }
function miTable() { return supabase.from('module_items') as unknown as MiBuilder }

type MicInsert = { item_id: string; content_type: ContentItemType; title: string; description: string | null; content_text: string | null; file_url: string | null; order_index: number }
type MicBuilder = { insert(d: MicInsert): SelectSingle }
function micTable() { return supabase.from('module_item_content') as unknown as MicBuilder }

type SipInsert = { student_id: string; item_id: string; is_completed: boolean; completed_at: string | null; quiz_passed?: boolean }
type SipBuilder = { upsert(d: SipInsert, opts: { onConflict: string }): Promise<{ error: Error | null }> }
function sipTable() { return supabase.from('student_item_progress') as unknown as SipBuilder }

// ── Simple content envelope (text + optional attachments, stored as JSON in simple_content) ──

export interface SimpleContentAttachment {
  type: 'video' | 'pdf' | 'image'
  title: string
  url: string
}
export interface SimpleContentData {
  text: string
  attachments: SimpleContentAttachment[]
}

export function parseSimpleContent(raw: string | null | undefined): SimpleContentData {
  if (!raw) return { text: '', attachments: [] }
  try {
    const parsed = JSON.parse(raw) as Partial<SimpleContentData>
    if (parsed && typeof parsed === 'object' && 'text' in parsed) {
      return { text: parsed.text ?? '', attachments: Array.isArray(parsed.attachments) ? parsed.attachments : [] }
    }
  } catch { /* legacy plain-text value, not JSON */ }
  return { text: raw, attachments: [] }
}

export function serializeSimpleContent(data: SimpleContentData): string {
  return JSON.stringify(data)
}

// ── Module reads ─────────────────────────────────────────────────────────────

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

export interface ModuleItemWithContent extends ModuleItem {
  pieces: ModuleItemContent[] // empty for 'quiz' type items
}
export interface ModuleWithItems extends LearningModule {
  items: ModuleItemWithContent[]
}

export async function getModuleWithItems(moduleId: string): Promise<ModuleWithItems> {
  const module = await getModuleById(moduleId)
  if (module.module_type !== 'structured') return { ...module, items: [] }

  const { data: items, error } = await supabase
    .from('module_items')
    .select('*')
    .eq('module_id', moduleId)
    .order('order_index', { ascending: true })
  if (error) throw error
  const itemRows = (items ?? []) as unknown as ModuleItem[]
  if (itemRows.length === 0) return { ...module, items: [] }

  const contentItemIds = itemRows.filter(i => i.type === 'content').map(i => i.id)
  const piecesByItem: Record<string, ModuleItemContent[]> = {}
  if (contentItemIds.length > 0) {
    const { data: pieces } = await supabase
      .from('module_item_content')
      .select('*')
      .in('item_id', contentItemIds)
      .order('order_index', { ascending: true })
    for (const p of (pieces ?? []) as unknown as ModuleItemContent[]) (piecesByItem[p.item_id] ??= []).push(p)
  }

  return { ...module, items: itemRows.map(i => ({ ...i, pieces: piecesByItem[i.id] ?? [] })) }
}

// ── Module progress (student) ────────────────────────────────────────────────

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
  const { error } = await smpTable().upsert(
    { student_id: studentId, module_id: moduleId, progress: 0, completed: false, last_accessed: new Date().toISOString() },
    { onConflict: 'student_id,module_id' },
  )
  if (error) throw error
  await logActivity(studentId, 'module_enrolled', `Enrolled in module ${moduleId}`)
}

export async function updateProgress(moduleId: string, studentId: string, progress: number): Promise<void> {
  const { error } = await smpTable()
    .update({ progress, last_accessed: new Date().toISOString() })
    .eq('student_id', studentId)
    .eq('module_id', moduleId)
  if (error) throw error
}

export async function markAsCompleted(moduleId: string, studentId: string): Promise<void> {
  const { error } = await smpTable()
    .update({ progress: 100, completed: true, completed_at: new Date().toISOString(), last_accessed: new Date().toISOString() })
    .eq('student_id', studentId)
    .eq('module_id', moduleId)
  if (error) throw error
  await logActivity(studentId, 'module_completed', `Completed module ${moduleId}`)
}

// ── Item progress (student, structured modules) ──────────────────────────────

export async function getItemProgress(studentId: string, moduleId: string): Promise<StudentItemProgress[]> {
  const { data: items } = await supabase.from('module_items').select('id').eq('module_id', moduleId)
  const itemIds = ((items ?? []) as { id: string }[]).map(i => i.id)
  if (itemIds.length === 0) return []
  const { data, error } = await supabase
    .from('student_item_progress')
    .select('*')
    .eq('student_id', studentId)
    .in('item_id', itemIds)
  if (error) throw error
  return (data ?? []) as unknown as StudentItemProgress[]
}

export async function markItemComplete(
  moduleId: string, itemId: string, studentId: string, completed: boolean, quizPassed?: boolean,
): Promise<void> {
  const payload: SipInsert = { student_id: studentId, item_id: itemId, is_completed: completed, completed_at: completed ? new Date().toISOString() : null }
  if (quizPassed !== undefined) payload.quiz_passed = quizPassed
  const { error } = await sipTable().upsert(payload, { onConflict: 'student_id,item_id' })
  if (error) throw error

  // Recompute overall module progress from item completion ratio
  const { data: items } = await supabase.from('module_items').select('id').eq('module_id', moduleId)
  const itemIds = ((items ?? []) as { id: string }[]).map(i => i.id)
  const total = itemIds.length
  let completedCount = 0
  if (total > 0) {
    const { count } = await supabase
      .from('student_item_progress')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .in('item_id', itemIds)
      .eq('is_completed', true)
    completedCount = count ?? 0
  }
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0
  const allComplete = total > 0 && completedCount === total

  await smpTable().upsert(
    {
      student_id: studentId, module_id: moduleId, progress: pct, completed: allComplete,
      completed_at: allComplete ? new Date().toISOString() : null, last_accessed: new Date().toISOString(),
    },
    { onConflict: 'student_id,module_id' },
  )
  if (allComplete) await logActivity(studentId, 'module_completed', `Completed module ${moduleId}`)
}

// ── Module items CRUD (admin) ─────────────────────────────────────────────────

export interface ContentPieceInput {
  id?: string
  content_type: ContentItemType
  title: string
  description?: string | null
  content_text?: string | null
  file_url?: string | null
  order_index: number
}

async function createContentPiece(itemId: string, p: ContentPieceInput): Promise<ModuleItemContent> {
  const { data, error } = await micTable().insert({
    item_id: itemId, content_type: p.content_type, title: p.title,
    description: p.description ?? null, content_text: p.content_text ?? null, file_url: p.file_url ?? null, order_index: p.order_index,
  }).select().single()
  if (error) throw error
  return data as unknown as ModuleItemContent
}

export async function createContentItem(
  moduleId: string,
  data: { title: string; description?: string | null; order_index: number },
  pieces: ContentPieceInput[],
): Promise<ModuleItemWithContent> {
  const { data: row, error } = await miTable()
    .insert({ module_id: moduleId, type: 'content', title: data.title, description: data.description ?? null, order_index: data.order_index })
    .select().single()
  if (error) throw error
  const item = row as unknown as ModuleItem

  const savedPieces: ModuleItemContent[] = []
  for (const p of pieces) savedPieces.push(await createContentPiece(item.id, p))
  return { ...item, pieces: savedPieces }
}

export async function updateContentItem(
  itemId: string,
  data: Partial<{ title: string; description: string | null }>,
  pieces: ContentPieceInput[],
): Promise<void> {
  if (Object.keys(data).length > 0) {
    const { error } = await miTable().update({ ...data, updated_at: new Date().toISOString() }).eq('id', itemId)
    if (error) throw error
  }
  // Pieces are a small list — wipe and recreate (same simplification used for quiz options/answers)
  await supabase.from('module_item_content').delete().eq('item_id', itemId)
  for (const p of pieces) await createContentPiece(itemId, p)
}

export async function createQuizItem(
  moduleId: string,
  data: { title: string; description?: string | null; order_index: number },
): Promise<ModuleItem> {
  const { data: row, error } = await miTable()
    .insert({ module_id: moduleId, type: 'quiz', title: data.title, description: data.description ?? null, order_index: data.order_index })
    .select().single()
  if (error) throw error
  return row as unknown as ModuleItem
}

export async function updateItemMeta(itemId: string, data: Partial<{ title: string; description: string | null }>): Promise<void> {
  const { error } = await miTable().update({ ...data, updated_at: new Date().toISOString() }).eq('id', itemId)
  if (error) throw error
}

export async function deleteItem(itemId: string): Promise<void> {
  const { error } = await supabase.from('module_items').delete().eq('id', itemId)
  if (error) throw error
}

export async function reorderItems(orderedItemIds: string[]): Promise<void> {
  for (let i = 0; i < orderedItemIds.length; i++) {
    const { error } = await miTable().update({ order_index: i }).eq('id', orderedItemIds[i])
    if (error) throw error
  }
}

// ── File upload (video/pdf/image for module content) ────────────────────────

export async function uploadModuleFile(file: File, adminId: string): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${adminId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('module-content').upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from('module-content').getPublicUrl(path)
  return data.publicUrl
}

// ── Module CRUD (admin) ───────────────────────────────────────────────────────

export interface ModuleBasicInfo {
  title: string
  description: string
  difficulty_level: DifficultyLevel
  duration_hours: number
}

export async function createSimpleModule(
  adminId: string,
  moduleData: ModuleBasicInfo,
  simpleContent: SimpleContentData,
): Promise<LearningModule> {
  const { data, error } = await lmTable()
    .insert({ created_by: adminId, ...moduleData, module_type: 'simple', simple_content: serializeSimpleContent(simpleContent), content: {} })
    .select().single()
  if (error) throw error
  return data as unknown as LearningModule
}

export async function createStructuredModule(adminId: string, moduleData: ModuleBasicInfo): Promise<LearningModule> {
  const { data, error } = await lmTable()
    .insert({ created_by: adminId, ...moduleData, module_type: 'structured', content: {} })
    .select().single()
  if (error) throw error
  return data as unknown as LearningModule
}

export async function updateSimpleModule(
  moduleId: string,
  moduleData: Partial<ModuleBasicInfo>,
  simpleContent?: SimpleContentData,
): Promise<void> {
  const payload: LmUpdate = { ...moduleData }
  if (simpleContent) payload.simple_content = serializeSimpleContent(simpleContent)
  const { error } = await lmTable().update(payload).eq('id', moduleId)
  if (error) throw error
}

export async function updateModuleBasicInfo(moduleId: string, moduleData: Partial<ModuleBasicInfo>): Promise<void> {
  const { error } = await lmTable().update(moduleData).eq('id', moduleId)
  if (error) throw error
}

export async function deleteModule(moduleId: string): Promise<void> {
  const { error } = await supabase.from('learning_modules').delete().eq('id', moduleId)
  if (error) throw error
}

export async function toggleModuleActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await lmTable().update({ is_active: isActive }).eq('id', id)
  if (error) throw error
}
