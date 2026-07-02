import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getMentorClasses, createClass, resetClassCode, deactivateClass, getClassRoster, redeemClassCode,
  getStudentClasses,
} from '@/services/classService'
import type { ClassWithMeta } from '@/services/classService'
import { mentorshipKeys } from './useMentorship'
import { useToast } from './use-toast'

export const classKeys = {
  mentorClasses:  (mentorId:  string) => ['mentor-classes',  mentorId ] as const,
  studentClasses: (studentId: string) => ['student-classes', studentId] as const,
  roster:         (classId:   string) => ['class-roster',    classId  ] as const,
}

export function useStudentClasses(studentId: string) {
  return useQuery({
    queryKey: classKeys.studentClasses(studentId),
    queryFn:  () => getStudentClasses(studentId),
    enabled:  !!studentId,
  })
}

export function useMentorClasses(mentorId: string) {
  return useQuery({
    queryKey: classKeys.mentorClasses(mentorId),
    queryFn:  () => getMentorClasses(mentorId),
    enabled:  !!mentorId,
  })
}

export function useClassRoster(classId: string) {
  return useQuery({
    queryKey: classKeys.roster(classId),
    queryFn:  () => getClassRoster(classId),
    enabled:  !!classId,
  })
}

export function useCreateClass() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ moduleId, name }: { moduleId: string; name: string; mentorId: string; moduleTitle: string }) =>
      createClass(moduleId, name),
    onSuccess: (newClass, { mentorId, moduleTitle }) => {
      // Optimistic update so the card appears instantly without waiting for a refetch.
      qc.setQueryData(classKeys.mentorClasses(mentorId), (old: ClassWithMeta[] | undefined) => [
        { ...newClass, module_title: moduleTitle, enrolled_count: 0 },
        ...(old ?? []),
      ])
      // Invalidate so the next background refetch brings fresh server data.
      qc.invalidateQueries({ queryKey: classKeys.mentorClasses(mentorId) })
      toast({ title: 'Class created!', description: `Share code ${newClass.join_code} with your students.` })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useResetClassCode() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ classId }: { classId: string; mentorId: string }) => resetClassCode(classId),
    onSuccess: (newCode, { classId, mentorId }) => {
      qc.setQueryData(classKeys.mentorClasses(mentorId), (old: ClassWithMeta[] | undefined) =>
        old?.map(c => c.id === classId ? { ...c, join_code: newCode } : c)
      )
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useDeactivateClass() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ classId }: { classId: string; mentorId: string }) => deactivateClass(classId),
    onSuccess: (_, { classId, mentorId }) => {
      qc.setQueryData(classKeys.mentorClasses(mentorId), (old: ClassWithMeta[] | undefined) =>
        old?.map(c => c.id === classId ? { ...c, is_active: false } : c)
      )
      toast({ title: 'Class deactivated.' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useRedeemClassCode() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ code, studentId }: { code: string; studentId: string }) =>
      redeemClassCode(code, studentId),
    onSuccess: (result, { studentId }) => {
      qc.invalidateQueries({ queryKey: ['module-progress', studentId] })
      qc.invalidateQueries({ queryKey: classKeys.studentClasses(studentId) })
      qc.invalidateQueries({ queryKey: mentorshipKeys.activeMentors(studentId) })
      qc.invalidateQueries({ queryKey: mentorshipKeys.activeMentor(studentId) })
      qc.invalidateQueries({ queryKey: mentorshipKeys.requests(studentId) })
      toast({
        title: 'Class joined!',
        description: `Enrolled in "${result.moduleTitle}" · Class "${result.className}".`,
      })
    },
    onError: (err: Error) => toast({ title: 'Invalid code', description: err.message, variant: 'destructive' }),
  })
}
