import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAllProjects, getProjectById, getStudentSubmissions,
  getMentorFeedback, submitProject, uploadProjectFile,
} from '@/services/projectService'
import { useToast } from './use-toast'

export const projectKeys = {
  all: ['projects'] as const,
  byId: (id: string) => ['projects', id] as const,
  submissions: (studentId: string) => ['project-submissions', studentId] as const,
  feedback: (submissionId: string) => ['mentor-feedback', submissionId] as const,
}

export function useProjects() {
  return useQuery({ queryKey: projectKeys.all, queryFn: getAllProjects, staleTime: 1000 * 60 * 5 })
}

export function useProject(id: string) {
  return useQuery({ queryKey: projectKeys.byId(id), queryFn: () => getProjectById(id), enabled: !!id })
}

export function useStudentSubmissions(studentId: string) {
  return useQuery({
    queryKey: projectKeys.submissions(studentId),
    queryFn: () => getStudentSubmissions(studentId),
    enabled: !!studentId,
  })
}

export function useMentorFeedback(submissionId: string) {
  return useQuery({
    queryKey: projectKeys.feedback(submissionId),
    queryFn: () => getMentorFeedback(submissionId),
    enabled: !!submissionId,
  })
}

export function useSubmitProject() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async ({
      projectId, studentId, content, file,
    }: { projectId: string; studentId: string; content: string; file?: File }) => {
      let fileUrl: string | undefined
      if (file) fileUrl = await uploadProjectFile(file, studentId, projectId)
      return submitProject(projectId, studentId, content, fileUrl)
    },
    onSuccess: (_, { studentId }) => {
      qc.invalidateQueries({ queryKey: projectKeys.submissions(studentId) })
      toast({ title: 'Submitted!', description: 'Your project has been submitted for review.' })
    },
    onError: (err: Error) => toast({ title: 'Submission failed', description: err.message, variant: 'destructive' }),
  })
}
