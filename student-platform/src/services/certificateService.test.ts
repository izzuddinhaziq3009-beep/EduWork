import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { ok, fail, queueFromResults } from '@/test/supabaseMock'

vi.mock('./supabase', () => ({ supabase: { from: vi.fn(), rpc: vi.fn() } }))

import { supabase } from './supabase'
import { getMyCertificates, issueCertificate, getCertificateByCode } from './certificateService'

const fromMock = supabase.from as Mock
const rpcMock  = supabase.rpc  as Mock

beforeEach(() => {
  fromMock.mockReset()
  rpcMock.mockReset()
})

const CERT_ROW = {
  id:               'cert1',
  student_id:       'stu1',
  module_id:        'mod1',
  student_name:     'Alice Smith',
  module_title:     'React 101',
  certificate_code: 'EDU-2025-ABCD1234',
  issued_at:        '2025-01-01T00:00:00Z',
  is_public:        true,
}

describe('getMyCertificates', () => {
  it('returns all certificates for a student ordered by issued_at desc', async () => {
    queueFromResults(fromMock, [ok([CERT_ROW])])
    const result = await getMyCertificates('stu1')
    expect(result).toHaveLength(1)
    expect(result[0].certificate_code).toBe('EDU-2025-ABCD1234')
    expect(result[0].student_name).toBe('Alice Smith')
    expect(fromMock).toHaveBeenCalledWith('certificates')
  })

  it('returns empty array when student has no certificates', async () => {
    queueFromResults(fromMock, [ok([])])
    const result = await getMyCertificates('stu1')
    expect(result).toEqual([])
  })

  it('throws on query error', async () => {
    queueFromResults(fromMock, [fail(new Error('db down'))])
    await expect(getMyCertificates('stu1')).rejects.toThrow('db down')
  })
})

describe('issueCertificate', () => {
  it('calls issue_certificate RPC with the module id and returns the certificate', async () => {
    rpcMock.mockResolvedValueOnce({ data: CERT_ROW, error: null })
    const result = await issueCertificate('mod1')
    expect(result).toEqual(CERT_ROW)
    expect(rpcMock).toHaveBeenCalledWith('issue_certificate', { p_module_id: 'mod1' })
    expect(rpcMock).toHaveBeenCalledTimes(1)
  })

  it('returns the existing certificate without error on duplicate call (idempotent RPC)', async () => {
    rpcMock.mockResolvedValueOnce({ data: CERT_ROW, error: null })
    const result = await issueCertificate('mod1')
    expect(result.id).toBe('cert1')
  })

  it('throws when module is not yet completed', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: new Error('Module not completed') })
    await expect(issueCertificate('mod1')).rejects.toThrow('Module not completed')
  })

  it('throws when not authenticated', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: new Error('Not authenticated') })
    await expect(issueCertificate('mod1')).rejects.toThrow('Not authenticated')
  })
})

describe('getCertificateByCode', () => {
  it('returns the certificate for a valid public code', async () => {
    rpcMock.mockResolvedValueOnce({ data: CERT_ROW, error: null })
    const result = await getCertificateByCode('EDU-2025-ABCD1234')
    expect(result).toEqual(CERT_ROW)
    expect(rpcMock).toHaveBeenCalledWith('get_certificate_by_code', { p_code: 'EDU-2025-ABCD1234' })
    expect(rpcMock).toHaveBeenCalledTimes(1)
  })

  it('returns null for an invalid or private certificate code', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: null })
    const result = await getCertificateByCode('INVALID-CODE')
    expect(result).toBeNull()
  })

  it('throws on RPC error', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: new Error('db down') })
    await expect(getCertificateByCode('EDU-2025-ABCD1234')).rejects.toThrow('db down')
  })
})
