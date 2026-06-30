import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { ok, fail, queueFromResults } from '@/test/supabaseMock'

vi.mock('./supabase', () => ({ supabase: { from: vi.fn() } }))
vi.mock('@/utils/activityLog', () => ({ logActivity: vi.fn() }))

import { supabase } from './supabase'
import { getActiveChallenges, getChallengeWithCompany, submitChallenge } from './challengeService'

const fromMock = supabase.from as Mock

beforeEach(() => {
  fromMock.mockReset()
})

describe('getActiveChallenges', () => {
  it('attaches each challenge\'s company profile', async () => {
    queueFromResults(fromMock, [
      ok([{ id: 'c1', company_id: 'co1' }]),
      ok([{ id: 'co1', full_name: 'Acme' }]),
    ])
    const result = await getActiveChallenges()
    expect(result[0].company.full_name).toBe('Acme')
  })

  it('returns an empty array without a company lookup when there are no challenges', async () => {
    queueFromResults(fromMock, [ok([])])
    const result = await getActiveChallenges()
    expect(result).toEqual([])
    expect(fromMock).toHaveBeenCalledTimes(1)
  })

  it('throws on query error', async () => {
    queueFromResults(fromMock, [fail(new Error('boom'))])
    await expect(getActiveChallenges()).rejects.toThrow('boom')
  })
})

describe('getChallengeWithCompany', () => {
  it('returns null when the challenge does not exist', async () => {
    queueFromResults(fromMock, [ok(null)])
    expect(await getChallengeWithCompany('missing')).toBeNull()
  })

  it('falls back to an "Unknown" company when the profile is missing', async () => {
    queueFromResults(fromMock, [
      ok({ id: 'c1', company_id: 'co-missing' }),
      ok(null),
    ])
    const result = await getChallengeWithCompany('c1')
    expect(result?.company.full_name).toBe('Unknown')
  })
})

describe('submitChallenge', () => {
  it('inserts a submission from validation results and logs activity', async () => {
    queueFromResults(fromMock, [
      ok({ id: 'sub1', challenge_id: 'c1', student_id: 'stu1' }),
      ok({ title: 'My Challenge' }),
    ])
    const validation = {
      isValid: true, username: 'octocat', repoName: 'hello-world',
      commitCount: 5, readmeExists: true, privacyFileExists: true,
      steps: {
        urlFormat: { status: 'success' as const, message: '' },
        repoPublic: { status: 'success' as const, message: '' },
        readme: { status: 'success' as const, message: '' },
        privacy: { status: 'success' as const, message: '' },
        commits: { status: 'success' as const, message: '' },
      },
    }
    const result = await submitChallenge('c1', 'stu1', validation)
    expect(result.id).toBe('sub1')
  })

  it('throws when the insert errors', async () => {
    queueFromResults(fromMock, [fail(new Error('insert failed'))])
    const validation = {
      isValid: true,
      steps: {
        urlFormat: { status: 'success' as const, message: '' },
        repoPublic: { status: 'success' as const, message: '' },
        readme: { status: 'success' as const, message: '' },
        privacy: { status: 'success' as const, message: '' },
        commits: { status: 'success' as const, message: '' },
      },
    }
    await expect(submitChallenge('c1', 'stu1', validation)).rejects.toThrow('insert failed')
  })
})
