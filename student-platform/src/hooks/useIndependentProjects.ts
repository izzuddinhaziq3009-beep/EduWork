import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getStudentIndependentProjects, getIndependentProjectById,
  createIndependentProject, submitIndependentProject,
  markIndependentProjectCompleted, getAvailableIndependentProjects,
  updateIndependentProject, deleteIndependentProject,
  uploadIndependentProjectImage,
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

export function useUploadIndependentProjectImage() {
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ studentId, file }: { studentId: string; file: File }) =>
      uploadIndependentProjectImage(studentId, file),
    onError: (err: Error) => toast({ title: 'Upload failed', description: err.message, variant: 'destructive' }),
  })
}

export function useCreateIndependentProject() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ studentId, title, description, image_url }: { studentId: string; title: string; description: string; image_url?: string | null }) =>
      createIndependentProject(studentId, { title, description, image_url }),
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

export function useUpdateIndependentProject() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ projectId, studentId: _sid, ...payload }: {
      projectId: string; studentId: string
      title?: string; description?: string; github_url?: string | null; image_url?: string | null
    }) => updateIndependentProject(projectId, payload),
    onSuccess: (_, { studentId }) => {
      qc.invalidateQueries({ queryKey: indieKeys.student(studentId) })
      qc.invalidateQueries({ queryKey: indieKeys.available })
      toast({ title: 'Project updated!' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useDeleteIndependentProject() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ projectId }: { projectId: string; studentId: string }) =>
      deleteIndependentProject(projectId),
    onSuccess: (_, { studentId }) => {
      qc.invalidateQueries({ queryKey: indieKeys.student(studentId) })
      qc.invalidateQueries({ queryKey: indieKeys.available })
      toast({ title: 'Project deleted.' })
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
      qc.invalidateQueries({ queryKey: indieKeys.available })
      toast({ title: 'Project completed!', description: 'Your project is now visible in the Showcase.' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}
