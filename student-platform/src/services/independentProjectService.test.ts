import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { ok, fail, queueFromResults } from '@/test/supabaseMock'

vi.mock('./supabase', () => ({ supabase: { from: vi.fn() } }))

import { supabase } from './supabase'
import {
  getStudentIndependentProjects, getIndependentProjectById, createIndependentProject,
  submitIndependentProject, markIndependentProjectCompleted, getAvailableIndependentProjects,
} from './independentProjectService'

const fromMock = supabase.from as Mock

beforeEach(() => {
  fromMock.mockReset()
})

describe('getStudentIndependentProjects', () => {
  it('returns the student\'s projects', async () => {
    queueFromResults(fromMock, [ok([{ id: 'ip1' }])])
    expect(await getStudentIndependentProjects('stu-1')).toEqual([{ id: 'ip1' }])
  })

  it('throws on error', async () => {
    queueFromResults(fromMock, [fail(new Error('boom'))])
    await expect(getStudentIndependentProjects('stu-1')).rejects.toThrow('boom')
  })
})

describe('getIndependentProjectById', () => {
  it('returns the project', async () => {
    queueFromResults(fromMock, [ok({ id: 'ip1' })])
    expect(await getIndependentProjectById('ip1')).toEqual({ id: 'ip1' })
  })
})

describe('createIndependentProject', () => {
  it('creates a project with status in_progress', async () => {
    queueFromResults(fromMock, [ok({ id: 'ip1', status: 'in_progress' })])
    const result = await createIndependentProject('stu-1', { title: 'My Project', description: 'desc' })
    expect(result.status).toBe('in_progress')
  })
})

describe('submitIndependentProject', () => {
  it('updates status to submitted with a github url', async () => {
    queueFromResults(fromMock, [ok(null)])
    await expect(submitIndependentProject('ip1', 'https://github.com/me/repo')).resolves.toBeUndefined()
  })

  it('throws on update error', async () => {
    queueFromResults(fromMock, [fail(new Error('denied'))])
    await expect(submitIndependentProject('ip1')).rejects.toThrow('denied')
  })
})

describe('markIndependentProjectCompleted', () => {
  it('updates status to completed', async () => {
    queueFromResults(fromMock, [ok(null)])
    await expect(markIndependentProjectCompleted('ip1')).resolves.toBeUndefined()
  })
})

describe('getAvailableIndependentProjects', () => {
  it('returns completed projects for the public showcase', async () => {
    queueFromResults(fromMock, [ok([{ id: 'ip1', status: 'completed' }])])
    const result = await getAvailableIndependentProjects()
    expect(result).toEqual([{ id: 'ip1', status: 'completed' }])
  })
})
