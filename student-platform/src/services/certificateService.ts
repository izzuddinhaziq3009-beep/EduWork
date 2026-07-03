import { supabase } from './supabase'
import type { Certificate } from '@/types'

type UntypedRpc = (fn: string, params?: Record<string, unknown>) => Promise<{ data: unknown; error: Error | null }>
const rpc = supabase.rpc.bind(supabase) as unknown as UntypedRpc

export async function getMyCertificates(studentId: string): Promise<Certificate[]> {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('student_id', studentId)
    .order('issued_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as Certificate[]
}

export async function issueCertificate(moduleId: string): Promise<Certificate> {
  const { data, error } = await rpc('issue_certificate', { p_module_id: moduleId })
  if (error) throw error
  return data as Certificate
}

export async function getCertificateByCode(code: string): Promise<Certificate | null> {
  const { data, error } = await rpc('get_certificate_by_code', { p_code: code })
  if (error) throw error
  return (data ?? null) as Certificate | null
}
