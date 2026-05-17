import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getMentorDashboardStats, getMentorSubmissions, getMentorStudents,
  getSubmissionDetail, submitFeedback,
  getMentorshipRequests, acceptRequest, rejectRequest, getAcceptedMentees,
} from '@/services/mentorService'
import { useToast } from './use-toast'

export const mentorKeys = {
  stats:       (mentorId: string) => ['mentor-stats',       mentorId] as const,
  submissions: (mentorId: string) => ['mentor-submissions', mentorId] as const,
  students:    (mentorId: string) => ['mentor-students',    mentorId] as const,
  detail:      (id: string)       => ['submission-detail',  id      ] as const,
  requests:    (mentorId: string) => ['mentor-requests',    mentorId] as const,
  mentees:     (mentorId: string) => ['mentor-mentees',     mentorId] as const,
}

export function useMentorDashboardStats(mentorId: string) {
  return useQuery({
    queryKey: mentorKeys.stats(mentorId),
    queryFn:  () => getMentorDashboardStats(mentorId),
    enabled:  !!mentorId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useMentorSubmissions(mentorId: string) {
  return useQuery({
    queryKey: mentorKeys.submissions(mentorId),
    queryFn:  () => getMentorSubmissions(mentorId),
    enabled:  !!mentorId,
  })
}

export function useMentorStudents(mentorId: string) {
  return useQuery({
    queryKey: mentorKeys.students(mentorId),
    queryFn:  () => getMentorStudents(mentorId),
    enabled:  !!mentorId,
  })
}

export function useSubmissionDetail(submissionId: string) {
  return useQuery({
    queryKey: mentorKeys.detail(submissionId),
    queryFn:  () => getSubmissionDetail(submissionId),
    enabled:  !!submissionId,
  })
}

export function useSubmitFeedback() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({
      submissionId, mentorId, studentId, feedbackText, status,
    }: {
      submissionId: string
      mentorId:     string
      studentId:    string
      feedbackText: string
      status:       'approved' | 'revision_requested'
    }) => submitFeedback(submissionId, mentorId, studentId, feedbackText, status),
    onSuccess: (_, { submissionId, mentorId, status }) => {
      qc.invalidateQueries({ queryKey: mentorKeys.submissions(mentorId) })
      qc.invalidateQueries({ queryKey: mentorKeys.detail(submissionId) })
      qc.invalidateQueries({ queryKey: mentorKeys.stats(mentorId) })
      toast({
        title: status === 'approved' ? 'Submission approved!' : 'Revision requested',
        description: 'Student has been notified.',
      })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useMentorshipRequests(mentorId: string) {
  return useQuery({
    queryKey: mentorKeys.requests(mentorId),
    queryFn:  () => getMentorshipRequests(mentorId),
    enabled:  !!mentorId,
    refetchInterval: 30_000,
  })
}

export function useAcceptedMentees(mentorId: string) {
  return useQuery({
    queryKey: mentorKeys.mentees(mentorId),
    queryFn:  () => getAcceptedMentees(mentorId),
    enabled:  !!mentorId,
  })
}

export function useAcceptRequest() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ requestId, studentId, mentorId }: { requestId: string; studentId: string; mentorId: string }) =>
      acceptRequest(requestId, studentId),
    onSuccess: (_, { mentorId }) => {
      qc.invalidateQueries({ queryKey: mentorKeys.requests(mentorId) })
      qc.invalidateQueries({ queryKey: mentorKeys.mentees(mentorId) })
      qc.invalidateQueries({ queryKey: mentorKeys.stats(mentorId) })
      toast({ title: 'Request accepted!', description: 'Student has been notified.' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useRejectRequest() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ requestId, studentId }: { requestId: string; studentId: string; mentorId: string }) =>
      rejectRequest(requestId, studentId),
    onSuccess: (_, { mentorId }) => {
      qc.invalidateQueries({ queryKey: mentorKeys.requests(mentorId) })
      qc.invalidateQueries({ queryKey: mentorKeys.stats(mentorId) })
      toast({ title: 'Request declined.' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}
