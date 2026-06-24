import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAllModules, getModuleById, getModuleWithItems, getStudentModuleProgress, getProgressForModule,
  enrollInModule, updateProgress, markAsCompleted,
  getItemProgress, markItemComplete,
  createContentItem, updateContentItem, createQuizItem, updateItemMeta, deleteItem, reorderItems,
  createSimpleModule, createStructuredModule, updateSimpleModule, updateModuleBasicInfo,
  deleteModule, toggleModuleActive,
} from '@/services/moduleService'
import type { ModuleBasicInfo, SimpleContentData, ContentPieceInput } from '@/services/moduleService'
import { useToast } from './use-toast'

export const moduleKeys = {
  all: ['modules'] as const,
  byId: (id: string) => ['modules', id] as const,
  detail: (id: string) => ['modules', id, 'detail'] as const,
  progress: (studentId: string) => ['module-progress', studentId] as const,
  progressForModule: (moduleId: string, studentId: string) => ['module-progress', studentId, moduleId] as const,
  itemProgress: (studentId: string, moduleId: string) => ['item-progress', studentId, moduleId] as const,
}

const adminModulesKey = ['admin-modules'] as const

export function useModules() {
  return useQuery({ queryKey: moduleKeys.all, queryFn: getAllModules, staleTime: 1000 * 60 * 5 })
}

export function useModule(id: string) {
  return useQuery({ queryKey: moduleKeys.byId(id), queryFn: () => getModuleById(id), enabled: !!id })
}

export function useModuleDetail(id: string) {
  return useQuery({ queryKey: moduleKeys.detail(id), queryFn: () => getModuleWithItems(id), enabled: !!id })
}

export function useModuleProgress(studentId: string) {
  return useQuery({
    queryKey: moduleKeys.progress(studentId),
    queryFn: () => getStudentModuleProgress(studentId),
    enabled: !!studentId,
  })
}

export function useProgressForModule(moduleId: string, studentId: string) {
  return useQuery({
    queryKey: moduleKeys.progressForModule(moduleId, studentId),
    queryFn: () => getProgressForModule(moduleId, studentId),
    enabled: !!(moduleId && studentId),
  })
}

export function useEnrollModule() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ moduleId, studentId }: { moduleId: string; studentId: string }) =>
      enrollInModule(moduleId, studentId),
    onSuccess: (_, { studentId }) => {
      qc.invalidateQueries({ queryKey: moduleKeys.progress(studentId) })
      toast({ title: 'Enrolled!', description: 'You have been enrolled in this module.' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useUpdateProgress() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ moduleId, studentId, progress }: { moduleId: string; studentId: string; progress: number }) =>
      updateProgress(moduleId, studentId, progress),
    onSuccess: (_, { studentId }) => {
      qc.invalidateQueries({ queryKey: moduleKeys.progress(studentId) })
      toast({ title: 'Progress saved' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useCompleteModule() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ moduleId, studentId }: { moduleId: string; studentId: string }) =>
      markAsCompleted(moduleId, studentId),
    onSuccess: (_, { studentId }) => {
      qc.invalidateQueries({ queryKey: moduleKeys.progress(studentId) })
      toast({ title: 'Module completed!', description: 'Great work — this has been added to your portfolio.' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

// ── Item progress (structured modules) ────────────────────────────────────────

export function useItemProgress(studentId: string, moduleId: string) {
  return useQuery({
    queryKey: moduleKeys.itemProgress(studentId, moduleId),
    queryFn:  () => getItemProgress(studentId, moduleId),
    enabled:  !!(studentId && moduleId),
  })
}

export function useMarkItemComplete() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ moduleId, itemId, studentId, completed, quizPassed }: { moduleId: string; itemId: string; studentId: string; completed: boolean; quizPassed?: boolean }) =>
      markItemComplete(moduleId, itemId, studentId, completed, quizPassed),
    onSuccess: (_, { moduleId, studentId }) => {
      qc.invalidateQueries({ queryKey: moduleKeys.itemProgress(studentId, moduleId) })
      qc.invalidateQueries({ queryKey: moduleKeys.progress(studentId) })
      qc.invalidateQueries({ queryKey: moduleKeys.progressForModule(moduleId, studentId) })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

// ── Module CRUD (admin) — handles both simple & structured types ────────────

export type CreateModulePayload =
  | { type: 'simple';     adminId: string; moduleData: ModuleBasicInfo; simpleContent: SimpleContentData }
  | { type: 'structured'; adminId: string; moduleData: ModuleBasicInfo }

export type UpdateModulePayload =
  | { type: 'simple';     moduleId: string; moduleData: Partial<ModuleBasicInfo>; simpleContent?: SimpleContentData }
  | { type: 'structured'; moduleId: string; moduleData: Partial<ModuleBasicInfo> }

export function useCreateModule() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: (payload: CreateModulePayload) =>
      payload.type === 'simple'
        ? createSimpleModule(payload.adminId, payload.moduleData, payload.simpleContent)
        : createStructuredModule(payload.adminId, payload.moduleData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminModulesKey })
      qc.invalidateQueries({ queryKey: moduleKeys.all })
      toast({ title: 'Module created!' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useUpdateModule() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: (payload: UpdateModulePayload) =>
      payload.type === 'simple'
        ? updateSimpleModule(payload.moduleId, payload.moduleData, payload.simpleContent)
        : updateModuleBasicInfo(payload.moduleId, payload.moduleData),
    onSuccess: (_, payload) => {
      qc.invalidateQueries({ queryKey: adminModulesKey })
      qc.invalidateQueries({ queryKey: moduleKeys.all })
      qc.invalidateQueries({ queryKey: moduleKeys.detail(payload.moduleId) })
      qc.invalidateQueries({ queryKey: moduleKeys.byId(payload.moduleId) })
      toast({ title: 'Module updated.' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useDeleteModule() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: (id: string) => deleteModule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminModulesKey })
      qc.invalidateQueries({ queryKey: moduleKeys.all })
      toast({ title: 'Module deleted.' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useToggleModuleActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleModuleActive(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminModulesKey })
      qc.invalidateQueries({ queryKey: moduleKeys.all })
    },
  })
}

// ── Module items CRUD (admin) ─────────────────────────────────────────────────

function invalidateItems(qc: ReturnType<typeof useQueryClient>, moduleId: string) {
  qc.invalidateQueries({ queryKey: moduleKeys.detail(moduleId) })
}

export function useCreateContentItem() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ moduleId, data, pieces }: { moduleId: string; data: { title: string; description?: string | null; order_index: number }; pieces: ContentPieceInput[] }) =>
      createContentItem(moduleId, data, pieces),
    onSuccess: (_, { moduleId }) => { invalidateItems(qc, moduleId); toast({ title: 'Content item added.' }) },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useUpdateContentItem() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ itemId, data, pieces }: { itemId: string; moduleId: string; data: Partial<{ title: string; description: string | null }>; pieces: ContentPieceInput[] }) =>
      updateContentItem(itemId, data, pieces),
    onSuccess: (_, { moduleId }) => { invalidateItems(qc, moduleId); toast({ title: 'Content item saved.' }) },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useCreateQuizItem() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ moduleId, data }: { moduleId: string; data: { title: string; description?: string | null; order_index: number } }) =>
      createQuizItem(moduleId, data),
    onSuccess: (_, { moduleId }) => invalidateItems(qc, moduleId),
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useUpdateItemMeta() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; moduleId: string; data: Partial<{ title: string; description: string | null }> }) =>
      updateItemMeta(itemId, data),
    onSuccess: (_, { moduleId }) => invalidateItems(qc, moduleId),
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useDeleteItem() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ itemId }: { itemId: string; moduleId: string }) => deleteItem(itemId),
    onSuccess: (_, { moduleId }) => { invalidateItems(qc, moduleId); toast({ title: 'Item deleted.' }) },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useReorderItems() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ orderedItemIds }: { moduleId: string; orderedItemIds: string[] }) => reorderItems(orderedItemIds),
    onSuccess: (_, { moduleId }) => invalidateItems(qc, moduleId),
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}
