import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { ok, fail, queueFromResults } from '@/test/supabaseMock'

vi.mock('@/services/supabase', () => ({ supabase: { from: vi.fn() } }))

import { supabase } from '@/services/supabase'
import { logActivity, getUserActivity } from './activityLog'

const fromMock = supabase.from as Mock

beforeEach(() => {
  fromMock.mockReset()
})

describe('logActivity', () => {
  it('inserts an activity row for the given user', async () => {
    queueFromResults(fromMock, [ok(null)])
    await logActivity('user-1', 'module_completed', 'Completed Intro to React')
    expect(fromMock).toHaveBeenCalledWith('activity_logs')
  })

  it('swallows insert errors instead of throwing', async () => {
    queueFromResults(fromMock, [fail(new Error('insert failed'))])
    await expect(logActivity('user-1', 'module_completed', 'desc')).resolves.toBeUndefined()
  })
})

describe('getUserActivity', () => {
  it('returns the activity rows for a user', async () => {
    const rows = [{ id: '1', user_id: 'user-1', action: 'x', description: 'y', created_at: '2026-01-01' }]
    queueFromResults(fromMock, [ok(rows)])
    const result = await getUserActivity('user-1')
    expect(result).toEqual(rows)
  })

  it('returns an empty array when there is no data', async () => {
    queueFromResults(fromMock, [ok(null)])
    const result = await getUserActivity('user-1')
    expect(result).toEqual([])
  })

  it('throws when the query errors', async () => {
    queueFromResults(fromMock, [fail(new Error('boom'))])
    await expect(getUserActivity('user-1')).rejects.toThrow('boom')
  })
})
