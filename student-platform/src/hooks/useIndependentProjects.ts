import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getStudentIndependentProjects, getIndependentProjectById,
  createIndependentProject, submitIndependentProject,
  markIndependentProjectCompleted, getAvailableIndependentProjects,
} from '@/services/independentProjectService'
import { useToast } from './use-toast'

export const indieKeys = {
  student: (studentId: string) => ['indie-projects', studentId] as const,
  byId: (id: string) => ['indie-projects', 'detail', id] as const,
  available: ['indie-projects', 'available'] as const,
}

export function useStudentIndependentProjects(studentId: string) {
  return useQuery({
    queryKey: indieKeys.student(studentId),
    queryFn: () => getStudentIndependentProjects(studentId),
    enabled: !!studentId,
  })
}

export function useIndependentProject(id: string) {
  return useQuery({
    queryKey: indieKeys.byId(id),
    queryFn: () => getIndependentProjectById(id),
    enabled: !!id,
  })
}

export function useAvailableIndependentProjects() {
  return useQuery({
    queryKey: indieKeys.available,
    queryFn: getAvailableIndependentProjects,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateIndependentProject() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ studentId, title, description }: { studentId: string; title: string; description: string }) =>
      createIndependentProject(studentId, { title, description }),
    onSuccess: (_, { studentId }) => {
      qc.invalidateQueries({ queryKey: indieKeys.student(studentId) })
      toast({ title: 'Project created!', description: 'Your independent project has been started.' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useSubmitIndependentProject() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ projectId, githubUrl }: { projectId: string; githubUrl?: string; studentId: string }) =>
      submitIndependentProject(projectId, githubUrl),
    onSuccess: (_, { studentId }) => {
      qc.invalidateQueries({ queryKey: indieKeys.student(studentId) })
      qc.invalidateQueries({ queryKey: indieKeys.available })
      toast({ title: 'Project submitted!', description: 'Your independent project has been submitted.' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useCompleteIndependentProject() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ projectId }: { projectId: string; studentId: string }) =>
      markIndependentProjectCompleted(projectId),
    onSuccess: (_, { studentId }) => {
      qc.invalidateQueries({ queryKey: indieKeys.student(studentId) })
      toast({ title: 'Project completed!' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}
