import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { ok, fail, queueFromResults } from '@/test/supabaseMock'

vi.mock('./supabase', () => ({ supabase: { from: vi.fn() } }))
vi.mock('@/utils/activityLog', () => ({ logActivity: vi.fn() }))

import { supabase } from './supabase'
import {
  getAvailableMentors, getMentorProfile, sendMentorshipRequest,
  getStudentRequests, getStudentMentor, getStudentMentors,
} from './mentorshipService'

const fromMock = supabase.from as Mock

beforeEach(() => {
  fromMock.mockReset()
})

describe('getAvailableMentors', () => {
  it('returns mentor profiles', async () => {
    queueFromResults(fromMock, [ok([{ id: 'm1', role: 'mentor' }])])
    expect(await getAvailableMentors()).toEqual([{ id: 'm1', role: 'mentor' }])
  })

  it('throws on query error', async () => {
    queueFromResults(fromMock, [fail(new Error('boom'))])
    await expect(getAvailableMentors()).rejects.toThrow('boom')
  })
})

describe('getMentorProfile', () => {
  it('returns the mentor profile', async () => {
    queueFromResults(fromMock, [ok({ id: 'm1', role: 'mentor' })])
    expect(await getMentorProfile('m1')).toEqual({ id: 'm1', role: 'mentor' })
  })
})

describe('sendMentorshipRequest', () => {
  it('inserts the request and logs activity using the mentor\'s name', async () => {
    queueFromResults(fromMock, [
      ok({ id: 'req1', student_id: 'stu1', mentor_id: 'm1', message: 'hi' }),
      ok({ full_name: 'Mentor One' }),
    ])
    const result = await sendMentorshipRequest('stu1', 'm1', 'hi')
    expect(result.id).toBe('req1')
  })

  it('throws when the insert errors', async () => {
    queueFromResults(fromMock, [fail(new Error('insert failed'))])
    await expect(sendMentorshipRequest('stu1', 'm1', 'hi')).rejects.toThrow('insert failed')
  })
})

describe('getStudentRequests', () => {
  it('returns the student\'s requests, newest first', async () => {
    queueFromResults(fromMock, [ok([{ id: 'req1' }, { id: 'req2' }])])
    expect(await getStudentRequests('stu1')).toHaveLength(2)
  })
})

describe('getStudentMentor', () => {
  it('returns null when there is no accepted mentor', async () => {
    // Implementation now uses limit(1) + array check; null data → empty rows → null
    queueFromResults(fromMock, [ok(null)])
    expect(await getStudentMentor('stu1')).toBeNull()
    expect(fromMock).toHaveBeenCalledTimes(1)
  })

  it('returns the most recent accepted mentor\'s profile', async () => {
    queueFromResults(fromMock, [
      ok([{ mentor_id: 'm1' }]),
      ok({ id: 'm1', full_name: 'Mentor One' }),
    ])
    const result = await getStudentMentor('stu1')
    expect(result?.full_name).toBe('Mentor One')
  })
})

describe('getStudentMentors', () => {
  it('returns empty array when student has no accepted mentors', async () => {
    queueFromResults(fromMock, [ok([])])
    const result = await getStudentMentors('stu1')
    expect(result).toEqual([])
    expect(fromMock).toHaveBeenCalledTimes(1)
  })

  it('returns all accepted mentor profiles deduplicated by id', async () => {
    // Row 1 & 3 share the same mentor id — deduplication should yield 2 profiles
    queueFromResults(fromMock, [
      ok([{ mentor_id: 'm1' }, { mentor_id: 'm2' }, { mentor_id: 'm1' }]),
      ok([{ id: 'm1', full_name: 'Mentor One' }, { id: 'm2', full_name: 'Mentor Two' }]),
    ])
    const result = await getStudentMentors('stu1')
    expect(result).toHaveLength(2)
    expect(result.map(m => m.id)).toEqual(expect.arrayContaining(['m1', 'm2']))
  })
})

