import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCompanyProfile, updateCompanyProfile, getCompanyDashboardStats,
  getCompanyChallenges, getChallengeById, createChallenge, updateChallenge, deleteChallenge,
  getCompanyPendingChallenges, getCompanyApprovedChallenges, getCompanyRejectedChallenges,
  resubmitChallenge, getCompanyEligibleStudents,
  getAllCompanySubmissions, getChallengeSubmissions, getCompanySubmissionDetail,
  leaveFeedback, getSubmissionFeedback,
} from '@/services/companyService'
import { useToast } from './use-toast'
import type { DifficultyLevel } from '@/types'

export const companyKeys = {
  profile:     (id: string)  => ['company-profile',      id] as const,
  stats:       (id: string)  => ['company-stats',        id] as const,
  challenges:  (id: string)  => ['company-challenges',   id] as const,
  pending:     (id: string)  => ['company-challenges-pending',  id] as const,
  approved:    (id: string)  => ['company-challenges-approved', id] as const,
  rejected:    (id: string)  => ['company-challenges-rejected', id] as const,
  challenge:   (id: string)  => ['company-challenge',    id] as const,
  submissions: (id: string)  => ['company-submissions',  id] as const,
  forChallenge:(id: string)  => ['challenge-submissions', id] as const,
  subDetail:   (id: string)  => ['company-sub-detail',   id] as const,
  feedback:    (id: string)  => ['submission-feedback',  id] as const,
}

export function useCompanyProfile(companyId: string) {
  return useQuery({ queryKey: companyKeys.profile(companyId), queryFn: () => getCompanyProfile(companyId), enabled: !!companyId })
}

export function useCompanyDashboardStats(companyId: string) {
  return useQuery({ queryKey: companyKeys.stats(companyId), queryFn: () => getCompanyDashboardStats(companyId), enabled: !!companyId, staleTime: 60_000 })
}

export function useCompanyChallenges(companyId: string) {
  return useQuery({ queryKey: companyKeys.challenges(companyId), queryFn: () => getCompanyChallenges(companyId), enabled: !!companyId })
}

export function useCompanyPendingChallenges(companyId: string) {
  return useQuery({ queryKey: companyKeys.pending(companyId), queryFn: () => getCompanyPendingChallenges(companyId), enabled: !!companyId })
}

export function useCompanyApprovedChallenges(companyId: string) {
  return useQuery({ queryKey: companyKeys.approved(companyId), queryFn: () => getCompanyApprovedChallenges(companyId), enabled: !!companyId })
}

export function useCompanyRejectedChallenges(companyId: string) {
  return useQuery({ queryKey: companyKeys.rejected(companyId), queryFn: () => getCompanyRejectedChallenges(companyId), enabled: !!companyId })
}

export function useCompanyChallenge(id: string) {
  return useQuery({ queryKey: companyKeys.challenge(id), queryFn: () => getChallengeById(id), enabled: !!id })
}

export function useCompanyEligibleStudents(companyId: string) {
  return useQuery({ queryKey: ['company-eligible-students', companyId], queryFn: () => getCompanyEligibleStudents(companyId), enabled: !!companyId, staleTime: 60_000 })
}

export function useAllCompanySubmissions(companyId: string) {
  return useQuery({ queryKey: companyKeys.submissions(companyId), queryFn: () => getAllCompanySubmissions(companyId), enabled: !!companyId })
}

export function useChallengeSubmissions(challengeId: string) {
  return useQuery({ queryKey: companyKeys.forChallenge(challengeId), queryFn: () => getChallengeSubmissions(challengeId), enabled: !!challengeId })
}

export function useCompanySubmissionDetail(submissionId: string) {
  return useQuery({ queryKey: companyKeys.subDetail(submissionId), queryFn: () => getCompanySubmissionDetail(submissionId), enabled: !!submissionId })
}

export function useSubmissionFeedback(submissionId: string) {
  return useQuery({ queryKey: companyKeys.feedback(submissionId), queryFn: () => getSubmissionFeedback(submissionId), enabled: !!submissionId })
}

export function useUpdateCompanyProfile() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: { full_name?: string; company_description?: string; company_website?: string; company_industry?: string } }) =>
      updateCompanyProfile(companyId, data),
    onSuccess: (_, { companyId }) => {
      qc.invalidateQueries({ queryKey: companyKeys.profile(companyId) })
      toast({ title: 'Profile saved!' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useCreateChallenge() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ companyId, payload }: { companyId: string; payload: { title: string; description: string; requirements: string; difficulty_level: DifficultyLevel; deadline: string } }) =>
      createChallenge(companyId, payload),
    onSuccess: (_, { companyId }) => {
      qc.invalidateQueries({ queryKey: companyKeys.challenges(companyId) })
      qc.invalidateQueries({ queryKey: companyKeys.stats(companyId) })
      toast({ title: 'Challenge submitted!', description: 'It will go live after admin approval.' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useUpdateChallenge() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ challengeId, companyId, payload }: { challengeId: string; companyId: string; payload: Partial<{ title: string; description: string; requirements: string; difficulty_level: DifficultyLevel; deadline: string }> }) =>
      updateChallenge(challengeId, payload),
    onSuccess: (_, { companyId, challengeId }) => {
      qc.invalidateQueries({ queryKey: companyKeys.challenges(companyId) })
      qc.invalidateQueries({ queryKey: companyKeys.approved(companyId) })
      qc.invalidateQueries({ queryKey: companyKeys.challenge(challengeId) })
      toast({ title: 'Challenge updated!' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useResubmitChallenge() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({
      challengeId, companyName, challengeTitle, payload,
    }: {
      challengeId: string
      companyId: string
      companyName: string
      challengeTitle: string
      payload: Partial<{ title: string; description: string; requirements: string; difficulty_level: DifficultyLevel; deadline: string }>
    }) => resubmitChallenge(challengeId, companyName, challengeTitle, payload),
    onSuccess: (_, { companyId, challengeId }) => {
      qc.invalidateQueries({ queryKey: companyKeys.challenges(companyId) })
      qc.invalidateQueries({ queryKey: companyKeys.pending(companyId) })
      qc.invalidateQueries({ queryKey: companyKeys.rejected(companyId) })
      qc.invalidateQueries({ queryKey: companyKeys.challenge(challengeId) })
      toast({ title: 'Challenge resubmitted!', description: 'It will go live after admin re-approval.' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useDeleteChallenge() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ challengeId }: { challengeId: string; companyId: string }) =>
      deleteChallenge(challengeId),
    onSuccess: (_, { companyId }) => {
      qc.invalidateQueries({ queryKey: companyKeys.challenges(companyId) })
      qc.invalidateQueries({ queryKey: companyKeys.stats(companyId) })
      toast({ title: 'Challenge deleted.' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useLeaveFeedback() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ submissionId, reviewerId, studentId, feedbackText, rating, companyId }: {
      submissionId: string; reviewerId: string; studentId: string; feedbackText: string; rating: number; companyId: string
    }) => leaveFeedback(submissionId, reviewerId, studentId, feedbackText, rating),
    onSuccess: (_, { submissionId, companyId }) => {
      qc.invalidateQueries({ queryKey: companyKeys.subDetail(submissionId) })
      qc.invalidateQueries({ queryKey: companyKeys.submissions(companyId) })
      qc.invalidateQueries({ queryKey: companyKeys.feedback(submissionId) })
      toast({ title: 'Feedback submitted!', description: 'Student has been notified.' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}
