import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyCertificates, issueCertificate, getCertificateByCode } from '@/services/certificateService'

export const certKeys = {
  mine:   (studentId: string) => ['certificates', studentId] as const,
  byCode: (code: string)      => ['certificate', code]       as const,
}

export function useMyCertificates(studentId: string) {
  return useQuery({
    queryKey: certKeys.mine(studentId),
    queryFn:  () => getMyCertificates(studentId),
    enabled:  !!studentId,
  })
}

export function useIssueCertificate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ moduleId }: { moduleId: string; studentId: string }) =>
      issueCertificate(moduleId),
    onSuccess: (_, { studentId }) => {
      qc.invalidateQueries({ queryKey: certKeys.mine(studentId) })
    },
  })
}

export function useCertificateByCode(code: string) {
  return useQuery({
    queryKey: certKeys.byCode(code),
    queryFn:  () => getCertificateByCode(code),
    enabled:  !!code,
    retry:    false,
  })
}
