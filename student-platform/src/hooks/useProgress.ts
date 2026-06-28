import { useQuery } from '@tanstack/react-query'
import {
  getStudentOverallProgress,
  getModuleProgressDetails,
  getProjectProgressDetails,
} from '@/services/progressService'
import { getUserActivity } from '@/utils/activityLog'

export const progressKeys = {
  overall: (studentId: string) => ['progress-overall', studentId] as const,
  modules: (studentId: string) => ['progress-modules', studentId] as const,
  projects: (studentId: string) => ['progress-projects', studentId] as const,
  activity: (userId: string) => ['user-activity', userId] as const,
}

export function useOverallProgress(studentId: string) {
  return useQuery({
    queryKey: progressKeys.overall(studentId),
    queryFn: () => getStudentOverallProgress(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useModuleProgressDetails(studentId: string) {
  return useQuery({
    queryKey: progressKeys.modules(studentId),
    queryFn: () => getModuleProgressDetails(studentId),
    enabled: !!studentId,
  })
}

export function useProjectProgressDetails(studentId: string) {
  return useQuery({
    queryKey: progressKeys.projects(studentId),
    queryFn: () => getProjectProgressDetails(studentId),
    enabled: !!studentId,
  })
}

export function useUserActivity(userId: string) {
  return useQuery({
    queryKey: progressKeys.activity(userId),
    queryFn: () => getUserActivity(userId),
    enabled: !!userId,
    staleTime: 1000 * 60,
  })
}
