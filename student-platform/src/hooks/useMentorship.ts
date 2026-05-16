import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAvailableMentors, getMentorProfile,
  sendMentorshipRequest, getStudentRequests, getStudentMentor,
} from '@/services/mentorshipService'
import { useToast } from './use-toast'

export const mentorshipKeys = {
  mentors: ['mentors'] as const,
  mentorById: (id: string) => ['mentors', id] as const,
  requests: (studentId: string) => ['mentorship-requests', studentId] as const,
  activeMentor: (studentId: string) => ['active-mentor', studentId] as const,
}

export function useAvailableMentors() {
  return useQuery({ queryKey: mentorshipKeys.mentors, queryFn: getAvailableMentors, staleTime: 1000 * 60 * 5 })
}

export function useMentorProfile(mentorId: string) {
  return useQuery({
    queryKey: mentorshipKeys.mentorById(mentorId),
    queryFn: () => getMentorProfile(mentorId),
    enabled: !!mentorId,
  })
}

export function useStudentRequests(studentId: string) {
  return useQuery({
    queryKey: mentorshipKeys.requests(studentId),
    queryFn: () => getStudentRequests(studentId),
    enabled: !!studentId,
    refetchInterval: 30_000,
  })
}

export function useStudentMentor(studentId: string) {
  return useQuery({
    queryKey: mentorshipKeys.activeMentor(studentId),
    queryFn: () => getStudentMentor(studentId),
    enabled: !!studentId,
  })
}

export function useSendMentorshipRequest() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ studentId, mentorId, message }: { studentId: string; mentorId: string; message: string }) =>
      sendMentorshipRequest(studentId, mentorId, message),
    onSuccess: (_, { studentId }) => {
      qc.invalidateQueries({ queryKey: mentorshipKeys.requests(studentId) })
      toast({ title: 'Request sent!', description: 'Your mentorship request is pending review.' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}
