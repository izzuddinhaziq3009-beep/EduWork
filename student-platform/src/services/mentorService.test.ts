import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { ok, queueFromResults } from '@/test/supabaseMock'

vi.mock('./supabase', () => ({ supabase: { from: vi.fn() } }))
vi.mock('@/utils/activityLog', () => ({ logActivity: vi.fn() }))

import { supabase } from './supabase'
import {
  getMentorDashboardStats, getMentorSubmissions, submitFeedback,
  getMentorshipRequests, acceptRequest, rejectRequest, getAcceptedMentees,
} from './mentorService'

const fromMock = supabase.from as Mock

beforeEach(() => {
  fromMock.mockReset()
})

describe('getMentorDashboardStats', () => {
  it('skips the pending-review query when there are no accepted mentees', async () => {
    queueFromResults(fromMock, [
      ok([]),
      { data: null, error: null, count: 3 } as never,
      { data: null, error: null, count: 1 } as never,
    ])
    const result = await getMentorDashboardStats('mentor-1')
    expect(result).toEqual({ pendingReviews: 0, pendingRequests: 3, activeMentees: 1 })
  })

  it('counts pending submissions across all accepted mentees', async () => {
    queueFromResults(fromMock, [
      ok([{ student_id: 'stu1' }, { student_id: 'stu2' }]),
      { data: null, error: null, count: 4 } as never,
      { data: null, error: null, count: 2 } as never,
      { data: null, error: null, count: 2 } as never,
    ])
    const result = await getMentorDashboardStats('mentor-1')
    expect(result.pendingReviews).toBe(4)
    expect(result.activeMentees).toBe(2)
  })
})

describe('getMentorSubmissions', () => {
  it('returns an empty array when the mentor has no accepted mentees', async () => {
    queueFromResults(fromMock, [ok([])])
    const result = await getMentorSubmissions('mentor-1')
    expect(result).toEqual([])
    expect(fromMock).toHaveBeenCalledTimes(1)
  })

  it('builds submission context for accepted mentees', async () => {
    queueFromResults(fromMock, [
      ok([{ student_id: 'stu1' }]),
      ok([{ id: 'sub1', project_id: 'proj1', student_id: 'stu1' }]),
      ok([{ id: 'proj1', title: 'Project 1' }]),
      ok([{ id: 'stu1', full_name: 'Student One' }]),
      ok([]),
    ])
    const result = await getMentorSubmissions('mentor-1')
    expect(result).toHaveLength(1)
    expect(result[0].project.title).toBe('Project 1')
  })
})

describe('submitFeedback', () => {
  it('upserts feedback, updates submission status, and notifies + logs activity', async () => {
    queueFromResults(fromMock, [
      ok(null), // mfTable upsert
      ok(null), // psUpdateTable update
      ok(null), // notifTable insert
      ok({ project_id: 'proj1' }), // submission lookup
      ok({ title: 'Project 1' }), // project lookup
    ])
    await expect(submitFeedback('sub1', 'mentor-1', 'stu1', 'Nice work', 'approved')).resolves.toBeUndefined()
  })
})

describe('mentorship requests', () => {
  it('returns pending requests joined with student profiles', async () => {
    queueFromResults(fromMock, [
      ok([{ id: 'req1', student_id: 'stu1', mentor_id: 'mentor-1', status: 'pending' }]),
      ok([{ id: 'stu1', full_name: 'Student One' }]),
    ])
    const result = await getMentorshipRequests('mentor-1')
    expect(result[0].student.full_name).toBe('Student One')
  })

  it('returns an empty array immediately when there are no pending requests', async () => {
    queueFromResults(fromMock, [ok([])])
    const result = await getMentorshipRequests('mentor-1')
    expect(result).toEqual([])
    expect(fromMock).toHaveBeenCalledTimes(1)
  })

  it('accepts a request and notifies + logs activity for the student', async () => {
    queueFromResults(fromMock, [
      ok(null), // update status
      ok(null), // notify
      ok({ mentor_id: 'mentor-1' }), // request lookup
      ok({ full_name: 'Mentor One' }), // mentor lookup
    ])
    await expect(acceptRequest('req1', 'stu1')).resolves.toBeUndefined()
  })

  it('rejects a request and notifies the student', async () => {
    queueFromResults(fromMock, [ok(null), ok(null)])
    await expect(rejectRequest('req1', 'stu1')).resolves.toBeUndefined()
  })

  it('returns accepted mentees joined with student profiles', async () => {
    queueFromResults(fromMock, [
      ok([{ id: 'req1', student_id: 'stu1', status: 'accepted' }]),
      ok([{ id: 'stu1', full_name: 'Student One' }]),
    ])
    const result = await getAcceptedMentees('mentor-1')
    expect(result[0].student.full_name).toBe('Student One')
  })
})
