import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { ok, fail, queueFromResults } from '@/test/supabaseMock'

vi.mock('./supabase', () => ({ supabase: { from: vi.fn() } }))

import { supabase } from './supabase'
import {
  getCompanyProfile, updateCompanyProfile, getCompanyDashboardStats,
  getCompanyChallenges, createChallenge, deleteChallenge,
  getChallengeSubmissions, leaveFeedback, getStudentSummary,
} from './companyService'

const fromMock = supabase.from as Mock

beforeEach(() => {
  fromMock.mockReset()
})

describe('getCompanyProfile / updateCompanyProfile', () => {
  it('returns the profile', async () => {
    queueFromResults(fromMock, [ok({ id: 'co1', full_name: 'Acme' })])
    expect(await getCompanyProfile('co1')).toEqual({ id: 'co1', full_name: 'Acme' })
  })

  it('updates the profile', async () => {
    queueFromResults(fromMock, [ok(null)])
    await expect(updateCompanyProfile('co1', { full_name: 'New Name' })).resolves.toBeUndefined()
  })
})

describe('getCompanyDashboardStats', () => {
  it('returns zeroed stats when the company has no challenges', async () => {
    queueFromResults(fromMock, [ok([])])
    const result = await getCompanyDashboardStats('co1')
    expect(result).toEqual({ totalChallenges: 0, totalSubmissions: 0, pendingReviews: 0 })
    expect(fromMock).toHaveBeenCalledTimes(1)
  })

  it('aggregates submission and pending-review counts', async () => {
    queueFromResults(fromMock, [
      ok([{ id: 'c1' }, { id: 'c2' }]),
      { data: null, error: null, count: 5 } as never,
      { data: null, error: null, count: 2 } as never,
    ])
    const result = await getCompanyDashboardStats('co1')
    expect(result).toEqual({ totalChallenges: 2, totalSubmissions: 5, pendingReviews: 2 })
  })
})

describe('getCompanyChallenges', () => {
  it('attaches submission counts per challenge', async () => {
    queueFromResults(fromMock, [
      ok([{ id: 'c1' }, { id: 'c2' }]),
      ok([{ challenge_id: 'c1' }, { challenge_id: 'c1' }, { challenge_id: 'c2' }]),
    ])
    const result = await getCompanyChallenges('co1')
    expect(result.find(c => c.id === 'c1')?.submissionCount).toBe(2)
    expect(result.find(c => c.id === 'c2')?.submissionCount).toBe(1)
  })

  it('returns an empty array without a second query when there are no challenges', async () => {
    queueFromResults(fromMock, [ok([])])
    const result = await getCompanyChallenges('co1')
    expect(result).toEqual([])
    expect(fromMock).toHaveBeenCalledTimes(1)
  })
})

describe('createChallenge', () => {
  it('inserts as unapproved but active', async () => {
    queueFromResults(fromMock, [ok({ id: 'c1', is_approved: false, is_active: true })])
    const result = await createChallenge('co1', {
      title: 'Reduce churn', description: 'desc', requirements: 'reqs',
      difficulty_level: 'beginner', deadline: '2026-12-01T00:00',
    })
    expect(result.is_approved).toBe(false)
  })
})

describe('deleteChallenge', () => {
  it('deletes only unapproved challenges (scoped at the query level)', async () => {
    queueFromResults(fromMock, [ok(null)])
    await expect(deleteChallenge('c1')).resolves.toBeUndefined()
  })

  it('throws on delete error', async () => {
    queueFromResults(fromMock, [fail(new Error('denied'))])
    await expect(deleteChallenge('c1')).rejects.toThrow('denied')
  })
})

describe('getChallengeSubmissions', () => {
  it('builds full context (challenge, student, feedback) for each submission', async () => {
    queueFromResults(fromMock, [
      ok([{ id: 'sub1', challenge_id: 'c1', student_id: 'stu1' }]),
      ok([{ id: 'c1', title: 'Challenge 1' }]),
      ok([{ id: 'stu1', full_name: 'Student One' }]),
      ok([{ submission_id: 'sub1', feedback_text: 'Nice work' }]),
    ])
    const result = await getChallengeSubmissions('c1')
    expect(result).toHaveLength(1)
    expect(result[0].challenge.title).toBe('Challenge 1')
    expect(result[0].student.full_name).toBe('Student One')
    expect(result[0].feedback?.feedback_text).toBe('Nice work')
  })

  it('filters out submissions whose challenge or student record is missing', async () => {
    queueFromResults(fromMock, [
      ok([{ id: 'sub1', challenge_id: 'c-missing', student_id: 'stu1' }]),
      ok([]),
      ok([{ id: 'stu1', full_name: 'Student One' }]),
      ok([]),
    ])
    const result = await getChallengeSubmissions('c1')
    expect(result).toEqual([])
  })

  it('returns an empty array immediately when there are no submissions', async () => {
    queueFromResults(fromMock, [ok([])])
    const result = await getChallengeSubmissions('c1')
    expect(result).toEqual([])
    expect(fromMock).toHaveBeenCalledTimes(1)
  })
})

describe('leaveFeedback', () => {
  it('inserts feedback, updates submission status, and notifies the student', async () => {
    queueFromResults(fromMock, [
      ok(null), // cfTable insert
      { data: null, error: null, count: 1 } as never, // csTable update
      ok(null), // notifTable insert
    ])
    await expect(leaveFeedback('sub1', 'co1', 'stu1', 'Great work', 5)).resolves.toBeUndefined()
  })

  it('throws without notifying the student when the status update silently affects zero rows (e.g. missing RLS policy)', async () => {
    queueFromResults(fromMock, [
      ok(null), // cfTable insert
      { data: null, error: null, count: 0 } as never, // csTable update — RLS filtered it out
    ])
    await expect(leaveFeedback('sub1', 'co1', 'stu1', 'Great work', 5))
      .rejects.toThrow(/permission to review/)
    expect(fromMock).toHaveBeenCalledTimes(2)
  })

  it('throws when the feedback insert itself errors', async () => {
    queueFromResults(fromMock, [fail(new Error('insert failed'))])
    await expect(leaveFeedback('sub1', 'co1', 'stu1', 'Great work', 5)).rejects.toThrow('insert failed')
  })
})

describe('getStudentSummary', () => {
  it('aggregates completed/approved counts', async () => {
    queueFromResults(fromMock, [
      { data: null, error: null, count: 3 } as never,
      { data: null, error: null, count: 2 } as never,
      { data: null, error: null, count: 1 } as never,
    ])
    const result = await getStudentSummary('stu1')
    expect(result).toEqual({ completedModules: 3, approvedProjects: 2, completedChallenges: 1 })
  })
})
