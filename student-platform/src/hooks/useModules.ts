import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAllModules, getModuleById, getStudentModuleProgress, getProgressForModule,
  enrollInModule, updateProgress, markAsCompleted,
} from '@/services/moduleService'
import { useToast } from './use-toast'

export const moduleKeys = {
  all: ['modules'] as const,
  byId: (id: string) => ['modules', id] as const,
  progress: (studentId: string) => ['module-progress', studentId] as const,
  progressForModule: (moduleId: string, studentId: string) => ['module-progress', studentId, moduleId] as const,
}

export function useModules() {
  return useQuery({ queryKey: moduleKeys.all, queryFn: getAllModules, staleTime: 1000 * 60 * 5 })
}

export function useModule(id: string) {
  return useQuery({ queryKey: moduleKeys.byId(id), queryFn: () => getModuleById(id), enabled: !!id })
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
