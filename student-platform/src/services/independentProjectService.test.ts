import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { ok, fail, queueFromResults } from '@/test/supabaseMock'

vi.mock('./supabase', () => ({
  supabase: {
    from:    vi.fn(),
    storage: { from: vi.fn() },
  },
}))

import { supabase } from './supabase'
import {
  getStudentIndependentProjects, getIndependentProjectById, createIndependentProject,
  submitIndependentProject, markIndependentProjectCompleted, getAvailableIndependentProjects,
  updateIndependentProject, deleteIndependentProject, uploadIndependentProjectImage,
} from './independentProjectService'

const fromMock    = supabase.from          as Mock
const storageMock = supabase.storage.from  as Mock

beforeEach(() => {
  fromMock.mockReset()
  storageMock.mockReset()
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

  it('passes image_url to the insert when provided', async () => {
    queueFromResults(fromMock, [ok({ id: 'ip1', status: 'in_progress', image_url: 'https://cdn.example.com/img.jpg' })])
    const result = await createIndependentProject('stu-1', { title: 'My Project', description: 'desc', image_url: 'https://cdn.example.com/img.jpg' })
    expect(result.image_url).toBe('https://cdn.example.com/img.jpg')
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

describe('uploadIndependentProjectImage', () => {
  it('uploads and returns the public URL', async () => {
    const uploadFn      = vi.fn().mockResolvedValue({ error: null })
    const getPublicFn   = vi.fn().mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/stu-1/pic.jpg' } })
    storageMock.mockReturnValue({ upload: uploadFn, getPublicUrl: getPublicFn })

    const file = new File(['img'], 'pic.jpg', { type: 'image/jpeg' })
    const url  = await uploadIndependentProjectImage('stu-1', file)

    expect(url).toBe('https://cdn.example.com/stu-1/pic.jpg')
    expect(storageMock).toHaveBeenCalledWith('independent-project-images')
    expect(uploadFn).toHaveBeenCalledWith(expect.stringMatching(/^stu-1\//), file)
  })

  it('throws when the storage upload fails', async () => {
    const uploadFn = vi.fn().mockResolvedValue({ error: new Error('Network error') })
    storageMock.mockReturnValue({ upload: uploadFn, getPublicUrl: vi.fn() })

    const file = new File(['img'], 'pic.jpg', { type: 'image/jpeg' })
    await expect(uploadIndependentProjectImage('stu-1', file)).rejects.toThrow('Network error')
  })

  it('rejects unsupported file types before uploading', async () => {
    const file = new File(['doc'], 'doc.pdf', { type: 'application/pdf' })
    await expect(uploadIndependentProjectImage('stu-1', file)).rejects.toThrow(/Only JPG/)
    expect(storageMock).not.toHaveBeenCalled()
  })

  it('rejects files over 5 MB before uploading', async () => {
    const big = new File([new ArrayBuffer(6 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' })
    await expect(uploadIndependentProjectImage('stu-1', big)).rejects.toThrow(/5MB/)
    expect(storageMock).not.toHaveBeenCalled()
  })
})

describe('updateIndependentProject', () => {
  it('resolves on a successful update', async () => {
    queueFromResults(fromMock, [ok(null)])
    await expect(updateIndependentProject('ip1', { title: 'New title', description: 'Updated description here.' })).resolves.toBeUndefined()
  })

  it('can update github_url to null', async () => {
    queueFromResults(fromMock, [ok(null)])
    await expect(updateIndependentProject('ip1', { github_url: null })).resolves.toBeUndefined()
  })

  it('throws on update error', async () => {
    queueFromResults(fromMock, [fail(new Error('denied'))])
    await expect(updateIndependentProject('ip1', { title: 'x' })).rejects.toThrow('denied')
  })
})

describe('deleteIndependentProject', () => {
  it('resolves on a successful delete', async () => {
    queueFromResults(fromMock, [ok(null)])
    await expect(deleteIndependentProject('ip1')).resolves.toBeUndefined()
  })

  it('throws on delete error', async () => {
    queueFromResults(fromMock, [fail(new Error('forbidden'))])
    await expect(deleteIndependentProject('ip1')).rejects.toThrow('forbidden')
  })
})

describe('getAvailableIndependentProjects', () => {
  it('returns empty array without fetching profiles when there are no projects', async () => {
    queueFromResults(fromMock, [ok([])])
    const result = await getAvailableIndependentProjects()
    expect(result).toEqual([])
    // profiles query must NOT be called when there are no projects
    expect(fromMock).toHaveBeenCalledTimes(1)
  })

  it('attaches author_name from the profiles batch lookup', async () => {
    queueFromResults(fromMock, [
      ok([{ id: 'ip1', status: 'completed', student_id: 'stu-1' }]),
      ok([{ id: 'stu-1', full_name: 'Alice Smith' }]),
    ])
    const result = await getAvailableIndependentProjects()
    expect(result).toHaveLength(1)
    expect(result[0].author_name).toBe('Alice Smith')
    expect('profiles' in result[0]).toBe(false)
  })

  it('sets author_name to null when the profile lookup misses', async () => {
    queueFromResults(fromMock, [
      ok([{ id: 'ip1', status: 'completed', student_id: 'stu-99' }]),
      ok([]),  // profiles returns nothing
    ])
    const result = await getAvailableIndependentProjects()
    expect(result[0].author_name).toBeNull()
  })

  it('throws when the projects query fails', async () => {
    queueFromResults(fromMock, [fail(new Error('rls'))])
    await expect(getAvailableIndependentProjects()).rejects.toThrow('rls')
  })
})
