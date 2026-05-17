import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getActiveChallenges, getChallengeWithCompany,
  getStudentChallengeSubmissions, getChallengeSubmission,
  submitChallenge, validateGitHubUrl,
} from '@/services/challengeService'
import type { GitHubValidationResult } from '@/services/challengeService'
import { useToast } from './use-toast'

export const challengeKeys = {
  active:      ['challenges-active']            as const,
  byId:        (id: string) => ['challenge', id] as const,
  mySubs:      (sid: string) => ['challenge-subs', sid] as const,
  subFor:      (cid: string, sid: string) => ['challenge-sub', cid, sid] as const,
  validate:    (url: string) => ['github-validate', url] as const,
}

export function useActiveChallenges() {
  return useQuery({ queryKey: challengeKeys.active, queryFn: getActiveChallenges, staleTime: 1000 * 60 * 5 })
}

export function useChallenge(id: string) {
  return useQuery({ queryKey: challengeKeys.byId(id), queryFn: () => getChallengeWithCompany(id), enabled: !!id })
}

export function useStudentChallengeSubmissions(studentId: string) {
  return useQuery({
    queryKey: challengeKeys.mySubs(studentId),
    queryFn:  () => getStudentChallengeSubmissions(studentId),
    enabled:  !!studentId,
  })
}

export function useChallengeSubmission(challengeId: string, studentId: string) {
  return useQuery({
    queryKey: challengeKeys.subFor(challengeId, studentId),
    queryFn:  () => getChallengeSubmission(challengeId, studentId),
    enabled:  !!(challengeId && studentId),
  })
}

export function useSubmitChallenge() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ challengeId, studentId, validation }: {
      challengeId: string; studentId: string; validation: GitHubValidationResult
    }) => submitChallenge(challengeId, studentId, validation),
    onSuccess: (_, { studentId }) => {
      qc.invalidateQueries({ queryKey: challengeKeys.mySubs(studentId) })
      qc.invalidateQueries({ queryKey: challengeKeys.active })
      toast({ title: 'Submission received!', description: 'Your GitHub repository has been submitted.' })
    },
    onError: (err: Error) => toast({ title: 'Submission failed', description: err.message, variant: 'destructive' }),
  })
}

// Debounced GitHub URL validation
export function useValidateGitHub(url: string) {
  const [debouncedUrl, setDebouncedUrl] = useState('')

  useEffect(() => {
    const isLikelyComplete = url.includes('github.com/') && url.split('/').filter(Boolean).length >= 4
    if (!isLikelyComplete) { setDebouncedUrl(''); return }
    const t = setTimeout(() => setDebouncedUrl(url.trim()), 500)
    return () => clearTimeout(t)
  }, [url])

  return useQuery<GitHubValidationResult>({
    queryKey: challengeKeys.validate(debouncedUrl),
    queryFn:  () => validateGitHubUrl(debouncedUrl),
    enabled:  debouncedUrl.length > 20,
    staleTime: 1000 * 60 * 5,
    retry:    false,
  })
}
