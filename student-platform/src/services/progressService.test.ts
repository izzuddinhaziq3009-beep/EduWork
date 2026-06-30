import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { ok, fail, queueFromResults } from '@/test/supabaseMock'

vi.mock('./supabase', () => ({ supabase: { from: vi.fn() } }))

import { supabase } from './supabase'
import { getModuleProgressDetails, getProjectProgressDetails, getStudentOverallProgress } from './progressService'

const fromMock = supabase.from as Mock

beforeEach(() => {
  fromMock.mockReset()
})

describe('getModuleProgressDetails', () => {
  it('maps joined rows into progress + module pairs', async () => {
    queueFromResults(fromMock, [ok([
      {
        id: 'p1', student_id: 's1', module_id: 'm1', progress: 50, completed: false,
        completed_at: null, last_accessed: '2026-01-01',
        learning_modules: { id: 'm1', title: 'Intro' },
      },
    ])])
    const result = await getModuleProgressDetails('s1')
    expect(result).toEqual([{
      progress: { id: 'p1', student_id: 's1', module_id: 'm1', progress: 50, completed: false, completed_at: null, last_accessed: '2026-01-01' },
      module: { id: 'm1', title: 'Intro' },
    }])
  })

  it('throws on query error', async () => {
    queueFromResults(fromMock, [fail(new Error('boom'))])
    await expect(getModuleProgressDetails('s1')).rejects.toThrow('boom')
  })
})

describe('getProjectProgressDetails', () => {
  it('maps joined rows into submission + project pairs', async () => {
    queueFromResults(fromMock, [ok([
      {
        id: 'sub1', project_id: 'proj1', student_id: 's1', submission_content: 'text',
        file_url: null, status: 'submitted', submitted_at: '2026-01-01',
        projects: { id: 'proj1', title: 'Build a thing' },
      },
    ])])
    const result = await getProjectProgressDetails('s1')
    expect(result[0].project).toEqual({ id: 'proj1', title: 'Build a thing' })
    expect(result[0].submission.status).toBe('submitted')
  })
})

describe('getStudentOverallProgress', () => {
  it('computes percentages from raw counts', async () => {
    queueFromResults(fromMock, [
      { data: null, error: null, count: 10 } as never,
      ok([{ completed: true }, { completed: false }, { completed: true }]),
      ok([{ status: 'approved' }, { status: 'submitted' }]),
      { data: null, error: null, count: 4 } as never,
    ])

    const result = await getStudentOverallProgress('s1')
    expect(result).toEqual({
      totalModules: 10,
      completedModules: 2,
      totalSubmissions: 2,
      approvedSubmissions: 1,
      challengesAttempted: 4,
      modulesPercent: 20,
      projectsPercent: 50,
    })
  })

  it('returns zeroed percentages when there are no modules or submissions', async () => {
    queueFromResults(fromMock, [
      { data: null, error: null, count: null } as never,
      ok([]),
      ok([]),
      { data: null, error: null, count: null } as never,
    ])

    const result = await getStudentOverallProgress('s1')
    expect(result.modulesPercent).toBe(0)
    expect(result.projectsPercent).toBe(0)
    expect(result.totalModules).toBe(0)
  })
})
