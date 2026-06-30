import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { ok, fail, queueFromResults } from '@/test/supabaseMock'

vi.mock('./supabase', () => ({ supabase: { from: vi.fn() } }))
vi.mock('@/utils/activityLog', () => ({ logActivity: vi.fn() }))

import { supabase } from './supabase'
import { getAllProjects, getProjectById, getStudentSubmissions, getSubmissionForProject, submitProject } from './projectService'

const fromMock = supabase.from as Mock

beforeEach(() => {
  fromMock.mockReset()
})

describe('getAllProjects', () => {
  it('returns active projects ordered by due date', async () => {
    queueFromResults(fromMock, [ok([{ id: 'p1' }])])
    expect(await getAllProjects()).toEqual([{ id: 'p1' }])
  })

  it('throws on error', async () => {
    queueFromResults(fromMock, [fail(new Error('boom'))])
    await expect(getAllProjects()).rejects.toThrow('boom')
  })
})

describe('getProjectById', () => {
  it('returns the project', async () => {
    queueFromResults(fromMock, [ok({ id: 'p1' })])
    expect(await getProjectById('p1')).toEqual({ id: 'p1' })
  })
})

describe('getStudentSubmissions', () => {
  it('returns submissions for the student', async () => {
    queueFromResults(fromMock, [ok([{ id: 's1' }])])
    expect(await getStudentSubmissions('stu-1')).toEqual([{ id: 's1' }])
  })
})

describe('getSubmissionForProject', () => {
  it('returns null when no submission exists', async () => {
    queueFromResults(fromMock, [ok(null)])
    expect(await getSubmissionForProject('p1', 'stu-1')).toBeNull()
  })

  it('returns the submission when one exists', async () => {
    queueFromResults(fromMock, [ok({ id: 's1' })])
    expect(await getSubmissionForProject('p1', 'stu-1')).toEqual({ id: 's1' })
  })
})

describe('submitProject', () => {
  it('inserts the submission and logs activity', async () => {
    queueFromResults(fromMock, [
      ok({ id: 's1', project_id: 'p1', student_id: 'stu-1' }),
      ok({ title: 'Build a thing' }),
    ])
    const result = await submitProject('p1', 'stu-1', 'My submission content')
    expect(result).toEqual({ id: 's1', project_id: 'p1', student_id: 'stu-1' })
  })

  it('throws when the insert errors', async () => {
    queueFromResults(fromMock, [fail(new Error('insert failed'))])
    await expect(submitProject('p1', 'stu-1', 'content')).rejects.toThrow('insert failed')
  })
})
