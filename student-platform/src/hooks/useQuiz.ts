import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getQuizForItem, getQuizDetail, createQuiz, updateQuiz,
  getStudentQuizAttempts, startQuizAttempt, completeQuizAttempt, getAttemptResult,
} from '@/services/quizService'
import type { QuizConfigInput, QuestionInput } from '@/services/quizService'
import { markItemComplete } from '@/services/moduleService'
import { moduleKeys } from './useModules'
import { useToast } from './use-toast'

export const quizKeys = {
  forItem:       (itemId: string) => ['quiz-for-item', itemId] as const,
  detail:        (itemId: string) => ['quiz-detail', itemId] as const,
  attempts:      (studentId: string, itemId: string) => ['quiz-attempts', studentId, itemId] as const,
  attemptResult: (attemptId: string) => ['quiz-attempt-result', attemptId] as const,
}

export function useQuizForItem(itemId: string) {
  return useQuery({ queryKey: quizKeys.forItem(itemId), queryFn: () => getQuizForItem(itemId), enabled: !!itemId })
}

export function useQuizDetail(itemId: string) {
  return useQuery({ queryKey: quizKeys.detail(itemId), queryFn: () => getQuizDetail(itemId), enabled: !!itemId })
}

export function useStudentQuizAttempts(studentId: string, itemId: string) {
  return useQuery({ queryKey: quizKeys.attempts(studentId, itemId), queryFn: () => getStudentQuizAttempts(studentId, itemId), enabled: !!(studentId && itemId) })
}

export function useAttemptResult(attemptId: string) {
  return useQuery({ queryKey: quizKeys.attemptResult(attemptId), queryFn: () => getAttemptResult(attemptId), enabled: !!attemptId })
}

export function useCreateQuiz() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ itemId, quizData, questions }: { itemId: string; quizData: QuizConfigInput; questions: QuestionInput[] }) =>
      createQuiz(itemId, quizData, questions),
    onSuccess: (_, { itemId }) => {
      qc.invalidateQueries({ queryKey: quizKeys.forItem(itemId) })
      qc.invalidateQueries({ queryKey: quizKeys.detail(itemId) })
      toast({ title: 'Quiz saved!' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useUpdateQuiz() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ itemId, quizData, questions }: { itemId: string; quizData: Partial<QuizConfigInput>; questions: QuestionInput[] }) =>
      updateQuiz(itemId, quizData, questions),
    onSuccess: (_, { itemId }) => {
      qc.invalidateQueries({ queryKey: quizKeys.detail(itemId) })
      qc.invalidateQueries({ queryKey: quizKeys.forItem(itemId) })
      toast({ title: 'Quiz updated.' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useStartQuizAttempt() {
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ studentId, itemId }: { studentId: string; itemId: string }) => startQuizAttempt(studentId, itemId),
    onError: (err: Error) => toast({ title: 'Cannot start quiz', description: err.message, variant: 'destructive' }),
  })
}

export function useCompleteQuizAttempt() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ attemptId, answers, timeSpentSeconds }: {
      attemptId: string; answers: Record<string, string>; timeSpentSeconds: number
      moduleId: string; itemId: string; studentId: string
    }) => completeQuizAttempt(attemptId, answers, timeSpentSeconds),
    onSuccess: async (result, { moduleId, itemId, studentId }) => {
      qc.invalidateQueries({ queryKey: quizKeys.attempts(studentId, itemId) })
      if (result.attempt.passed) {
        await markItemComplete(moduleId, itemId, studentId, true, true)
        qc.invalidateQueries({ queryKey: moduleKeys.itemProgress(studentId, moduleId) })
        qc.invalidateQueries({ queryKey: moduleKeys.progress(studentId) })
        qc.invalidateQueries({ queryKey: moduleKeys.progressForModule(moduleId, studentId) })
      }
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}
