import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getStudentPortfolio, createPortfolio, updatePortfolio,
  togglePublic, getPublicPortfolio, autoGeneratePortfolioItems,
} from '@/services/portfolioService'
import { useToast } from './use-toast'

export const portfolioKeys = {
  student: (studentId: string) => ['portfolio', studentId] as const,
  public: (url: string) => ['portfolio-public', url] as const,
}

export function useStudentPortfolio(studentId: string) {
  return useQuery({
    queryKey: portfolioKeys.student(studentId),
    queryFn: () => getStudentPortfolio(studentId),
    enabled: !!studentId,
  })
}

export function usePublicPortfolio(publicUrl: string) {
  return useQuery({
    queryKey: portfolioKeys.public(publicUrl),
    queryFn: () => getPublicPortfolio(publicUrl),
    enabled: !!publicUrl,
    staleTime: 1000 * 60 * 10,
  })
}

export function useUpdatePortfolio() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async ({
      studentId, portfolioId, data,
    }: {
      studentId: string
      portfolioId?: string
      data: { title: string; bio: string; skills: string[] }
    }) => {
      if (portfolioId) {
        await updatePortfolio(portfolioId, data)
      } else {
        await createPortfolio(studentId, data)
      }
    },
    onSuccess: (_, { studentId }) => {
      qc.invalidateQueries({ queryKey: portfolioKeys.student(studentId) })
      toast({ title: 'Portfolio saved!' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useTogglePublic() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ portfolioId, isPublic }: { portfolioId: string; isPublic: boolean; studentId: string }) =>
      togglePublic(portfolioId, isPublic),
    onSuccess: (_, { studentId, isPublic }) => {
      qc.invalidateQueries({ queryKey: portfolioKeys.student(studentId) })
      toast({ title: isPublic ? 'Portfolio is now public!' : 'Portfolio set to private.' })
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })
}

export function useAutoGeneratePortfolioItems() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ studentId, portfolioId }: { studentId: string; portfolioId: string }) =>
      autoGeneratePortfolioItems(studentId, portfolioId),
    onSuccess: (_, { studentId }) => {
      qc.invalidateQueries({ queryKey: portfolioKeys.student(studentId) })
    },
  })
}
