import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { ok, fail, queueFromResults } from '@/test/supabaseMock'

vi.mock('./supabase', () => ({ supabase: { from: vi.fn() } }))

import { supabase } from './supabase'
import {
  getAllUsers, deactivateUser, reactivateUser, approveUser,
  getAllProjectsAdmin, deleteProject,
  approveChallenge, rejectChallenge, getPendingChallenges,
  getActivityLogs,
} from './adminService'

const fromMock = supabase.from as Mock

beforeEach(() => {
  fromMock.mockReset()
})

describe('getAllUsers', () => {
  it('returns all users when no role filter is given', async () => {
    queueFromResults(fromMock, [ok([{ id: '1', role: 'student' }, { id: '2', role: 'mentor' }])])
    const result = await getAllUsers()
    expect(result).toHaveLength(2)
  })

  it('throws on query error', async () => {
    queueFromResults(fromMock, [fail(new Error('boom'))])
    await expect(getAllUsers()).rejects.toThrow('boom')
  })
})

describe('deactivateUser / reactivateUser / approveUser', () => {
  it('deactivates a user', async () => {
    queueFromResults(fromMock, [ok(null)])
    await expect(deactivateUser('u1')).resolves.toBeUndefined()
  })

  it('reactivates a user', async () => {
    queueFromResults(fromMock, [ok(null)])
    await expect(reactivateUser('u1')).resolves.toBeUndefined()
  })

  it('approves a user', async () => {
    queueFromResults(fromMock, [ok(null)])
    await expect(approveUser('u1')).resolves.toBeUndefined()
  })

  it('throws when the update errors', async () => {
    queueFromResults(fromMock, [fail(new Error('denied'))])
    await expect(deactivateUser('u1')).rejects.toThrow('denied')
  })
})

describe('getAllProjectsAdmin / deleteProject', () => {
  it('returns all projects', async () => {
    queueFromResults(fromMock, [ok([{ id: 'p1' }])])
    expect(await getAllProjectsAdmin()).toEqual([{ id: 'p1' }])
  })

  it('deletes a project', async () => {
    queueFromResults(fromMock, [ok(null)])
    await expect(deleteProject('p1')).resolves.toBeUndefined()
  })
})

describe('challenge moderation', () => {
  it('approves a challenge and notifies the company', async () => {
    queueFromResults(fromMock, [ok(null), ok(null)])
    await expect(approveChallenge('c1', 'company-1', 'My Challenge')).resolves.toBeUndefined()
  })

  it('rejects a challenge with a reason and notifies the company', async () => {
    queueFromResults(fromMock, [ok(null), ok(null)])
    await expect(rejectChallenge('c1', 'company-1', 'My Challenge', 'Needs more detail')).resolves.toBeUndefined()
  })

  it('enriches pending challenges with their company profile', async () => {
    queueFromResults(fromMock, [
      ok([{ id: 'c1', company_id: 'co1', title: 'Challenge' }]),
      ok([{ id: 'co1', full_name: 'Acme Inc' }]),
    ])
    const result = await getPendingChallenges()
    expect(result[0].company).toEqual({ id: 'co1', full_name: 'Acme Inc' })
  })

  it('falls back to an "Unknown" company when the profile is missing', async () => {
    queueFromResults(fromMock, [
      ok([{ id: 'c1', company_id: 'co-missing', title: 'Challenge' }]),
      ok([]),
    ])
    const result = await getPendingChallenges()
    expect(result[0].company.full_name).toBe('Unknown')
  })

  it('returns an empty array without querying companies when there are no challenges', async () => {
    queueFromResults(fromMock, [ok([])])
    const result = await getPendingChallenges()
    expect(result).toEqual([])
    expect(fromMock).toHaveBeenCalledTimes(1)
  })
})

describe('getActivityLogs', () => {
  it('paginates and returns the total count', async () => {
    queueFromResults(fromMock, [{ data: [{ id: 'a1' }], error: null, count: 42 } as never])
    const result = await getActivityLogs(0, 20)
    expect(result).toEqual({ data: [{ id: 'a1' }], total: 42, page: 0 })
  })

  it('throws on query error', async () => {
    queueFromResults(fromMock, [{ data: null, error: new Error('boom'), count: null } as never])
    await expect(getActivityLogs(0, 20)).rejects.toThrow('boom')
  })
})
