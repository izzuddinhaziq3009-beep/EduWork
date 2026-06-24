import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSystemStats, getRecentActivity,
  getAllUsers, getUserById, updateUser, deactivateUser, reactivateUser, createUser, getUserAdminStats,
  getAllModulesAdmin,
  getAllProjectsAdmin, createProject, updateProject, deleteProject, toggleProjectActive,
  getAllIndependentProjectsAdmin, deleteIndependentProject,
  getPendingChallenges, getApprovedChallenges, getRejectedChallenges, getAllChallengesAdmin, approveChallenge, rejectChallenge,
  getActivityLogs, getUserActivityLogs, getLearningActivityLogs, getProjectActivityLogs, getChallengeActivityLogs,
} from '@/services/adminService'
import { useToast } from './use-toast'
import type { UserRole } from '@/types'

export const adminKeys = {
  stats:       ['admin-stats']             as const,
  activity:    ['admin-activity']          as const,
  users:       (role?: string) => ['admin-users', role ?? 'all'] as const,
  user:        (id: string) => ['admin-user', id] as const,
  userStats:   (id: string) => ['admin-user-stats', id] as const,
  modules:     ['admin-modules']           as const,
  projects:    ['admin-projects']          as const,
  indieProjs:  ['admin-indie-projects']    as const,
  challenges:  (filter: string) => ['admin-challenges', filter] as const,
  logs:        (page: number, search: string) => ['admin-logs', page, search] as const,
  logsType:    (type: string) => ['admin-logs-type', type] as const,
  logsUser:    (id: string) => ['admin-logs-user', id] as const,
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export function useSystemStats() {
  return useQuery({ queryKey: adminKeys.stats, queryFn: getSystemStats, staleTime: 60_000 })
}
export function useRecentActivity() {
  return useQuery({ queryKey: adminKeys.activity, queryFn: () => getRecentActivity(20), staleTime: 30_000 })
}

// ── Users ──────────────────────────────────────────────────────────────────
export function useAllUsers(role?: UserRole) {
  return useQuery({ queryKey: adminKeys.users(role), queryFn: () => getAllUsers(role), staleTime: 30_000 })
}
export function useAdminUser(userId: string) {
  return useQuery({ queryKey: adminKeys.user(userId), queryFn: () => getUserById(userId), enabled: !!userId })
}
export function useAdminUserStats(userId: string, role: UserRole) {
  return useQuery({ queryKey: adminKeys.userStats(userId), queryFn: () => getUserAdminStats(userId, role), enabled: !!(userId && role) })
}

export function useUpdateUser() {
  const qc = useQueryClient(); const { toast } = useToast()
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: { full_name?: string; email?: string } }) => updateUser(userId, data),
    onSuccess: (_, { userId }) => { qc.invalidateQueries({ queryKey: adminKeys.user(userId) }); qc.invalidateQueries({ queryKey: adminKeys.users() }); toast({ title: 'User updated.' }) },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}
export function useDeactivateUser() {
  const qc = useQueryClient(); const { toast } = useToast()
  return useMutation({
    mutationFn: (userId: string) => deactivateUser(userId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.users() }); toast({ title: 'User deactivated.' }) },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}
export function useReactivateUser() {
  const qc = useQueryClient(); const { toast } = useToast()
  return useMutation({
    mutationFn: (userId: string) => reactivateUser(userId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.users() }); toast({ title: 'User reactivated.' }) },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}
export function useCreateUser() {
  const qc = useQueryClient(); const { toast } = useToast()
  return useMutation({
    mutationFn: (payload: { email: string; password: string; full_name: string; role: UserRole }) => createUser(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.users() }); qc.invalidateQueries({ queryKey: adminKeys.stats }); toast({ title: 'User created!' }) },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

// ── Modules ────────────────────────────────────────────────────────────────
// Module create/update/delete/toggle hooks live in @/hooks/useModules (handle both simple & structured types)
export function useAllModulesAdmin() {
  return useQuery({ queryKey: adminKeys.modules, queryFn: getAllModulesAdmin })
}

// ── Projects ────────────────────────────────────────────────────────────────
export function useAllProjectsAdmin() {
  return useQuery({ queryKey: adminKeys.projects, queryFn: getAllProjectsAdmin })
}
export function useCreateProject() {
  const qc = useQueryClient(); const { toast } = useToast()
  return useMutation({
    mutationFn: ({ adminId, payload }: { adminId: string; payload: { title: string; description: string; requirements: string; due_date: string; module_id?: string } }) =>
      createProject(adminId, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.projects }); toast({ title: 'Project created!' }) },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}
export function useUpdateProject() {
  const qc = useQueryClient(); const { toast } = useToast()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<{ title: string; description: string; requirements: string; due_date: string; module_id: string | null }> }) =>
      updateProject(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.projects }); toast({ title: 'Project updated.' }) },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}
export function useDeleteProject() {
  const qc = useQueryClient(); const { toast } = useToast()
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.projects }); toast({ title: 'Project deleted.' }) },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}
export function useToggleProjectActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleProjectActive(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.projects }),
  })
}

// ── Independent projects ────────────────────────────────────────────────────
export function useAllIndependentProjectsAdmin() {
  return useQuery({ queryKey: adminKeys.indieProjs, queryFn: getAllIndependentProjectsAdmin })
}
export function useDeleteIndependentProject() {
  const qc = useQueryClient(); const { toast } = useToast()
  return useMutation({
    mutationFn: (id: string) => deleteIndependentProject(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: adminKeys.indieProjs }); toast({ title: 'Project deleted.' }) },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

// ── Challenge moderation ────────────────────────────────────────────────────
export function usePendingChallenges() {
  return useQuery({ queryKey: adminKeys.challenges('pending'), queryFn: getPendingChallenges, staleTime: 30_000 })
}
export function useApprovedChallenges() {
  return useQuery({ queryKey: adminKeys.challenges('approved'), queryFn: getApprovedChallenges, staleTime: 30_000 })
}
export function useRejectedChallenges() {
  return useQuery({ queryKey: adminKeys.challenges('rejected'), queryFn: getRejectedChallenges, staleTime: 30_000 })
}
export function useAllChallengesAdmin() {
  return useQuery({ queryKey: adminKeys.challenges('all'), queryFn: getAllChallengesAdmin, staleTime: 30_000 })
}

export function useApproveChallenge() {
  const qc = useQueryClient(); const { toast } = useToast()
  return useMutation({
    mutationFn: ({ challengeId, companyId, title }: { challengeId: string; companyId: string; title: string }) =>
      approveChallenge(challengeId, companyId, title),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.challenges('pending') })
      qc.invalidateQueries({ queryKey: adminKeys.challenges('approved') })
      qc.invalidateQueries({ queryKey: adminKeys.challenges('all') })
      qc.invalidateQueries({ queryKey: adminKeys.stats })
      toast({ title: 'Challenge approved!', description: 'Company has been notified.' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}
export function useRejectChallenge() {
  const qc = useQueryClient(); const { toast } = useToast()
  return useMutation({
    mutationFn: ({ challengeId, companyId, title, reason }: { challengeId: string; companyId: string; title: string; reason: string }) =>
      rejectChallenge(challengeId, companyId, title, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.challenges('pending') })
      qc.invalidateQueries({ queryKey: adminKeys.challenges('rejected') })
      qc.invalidateQueries({ queryKey: adminKeys.challenges('all') })
      toast({ title: 'Challenge rejected.', description: 'Company has been notified.' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

// ── Activity logs ───────────────────────────────────────────────────────────
export function useActivityLogs(page = 0, search = '') {
  return useQuery({ queryKey: adminKeys.logs(page, search), queryFn: () => getActivityLogs(page, 20, search), staleTime: 30_000 })
}
export function useUserActivityLogs(userId: string) {
  return useQuery({ queryKey: adminKeys.logsUser(userId), queryFn: () => getUserActivityLogs(userId), enabled: !!userId })
}
export function useLearningActivityLogs() {
  return useQuery({ queryKey: adminKeys.logsType('learning'), queryFn: getLearningActivityLogs, staleTime: 30_000 })
}
export function useProjectActivityLogs() {
  return useQuery({ queryKey: adminKeys.logsType('projects'), queryFn: getProjectActivityLogs, staleTime: 30_000 })
}
export function useChallengeActivityLogs() {
  return useQuery({ queryKey: adminKeys.logsType('challenges'), queryFn: getChallengeActivityLogs, staleTime: 30_000 })
}
