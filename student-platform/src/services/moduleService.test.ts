import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { ok, fail, queueFromResults } from '@/test/supabaseMock'

vi.mock('./supabase', () => ({ supabase: { from: vi.fn(), storage: { from: vi.fn() } } }))
vi.mock('@/utils/activityLog', () => ({ logActivity: vi.fn() }))

import { supabase } from './supabase'
import {
  parseSimpleContent, serializeSimpleContent,
  getAllModules, getModuleById, enrollInModule, updateProgress, markAsCompleted,
  createSimpleModule, deleteModule, updateModuleBasicInfo, uploadModuleImage,
} from './moduleService'

const fromMock = supabase.from as Mock

beforeEach(() => {
  fromMock.mockReset()
})

describe('parseSimpleContent', () => {
  it('returns empty content for null/undefined input', () => {
    expect(parseSimpleContent(null)).toEqual({ text: '', attachments: [] })
    expect(parseSimpleContent(undefined)).toEqual({ text: '', attachments: [] })
  })

  it('parses a JSON envelope with text and attachments', () => {
    const raw = JSON.stringify({ text: 'hello', attachments: [{ type: 'video', title: 'Vid', url: 'http://x' }] })
    expect(parseSimpleContent(raw)).toEqual({
      text: 'hello',
      attachments: [{ type: 'video', title: 'Vid', url: 'http://x' }],
    })
  })

  it('falls back to plain text for legacy non-JSON values', () => {
    expect(parseSimpleContent('just plain text')).toEqual({ text: 'just plain text', attachments: [] })
  })

  it('defaults a missing attachments array to empty', () => {
    expect(parseSimpleContent(JSON.stringify({ text: 'hi' }))).toEqual({ text: 'hi', attachments: [] })
  })
})

describe('serializeSimpleContent', () => {
  it('round-trips through parseSimpleContent', () => {
    const data = { text: 'hi', attachments: [{ type: 'pdf' as const, title: 'Doc', url: 'http://x' }] }
    expect(parseSimpleContent(serializeSimpleContent(data))).toEqual(data)
  })
})

describe('getAllModules', () => {
  it('returns active modules', async () => {
    const rows = [{ id: '1', title: 'Intro', is_active: true }]
    queueFromResults(fromMock, [ok(rows)])
    expect(await getAllModules()).toEqual(rows)
  })

  it('throws on query error', async () => {
    queueFromResults(fromMock, [fail(new Error('db down'))])
    await expect(getAllModules()).rejects.toThrow('db down')
  })
})

describe('getModuleById', () => {
  it('returns the module', async () => {
    queueFromResults(fromMock, [ok({ id: '1', title: 'Intro' })])
    expect(await getModuleById('1')).toEqual({ id: '1', title: 'Intro' })
  })

  it('throws when not found', async () => {
    queueFromResults(fromMock, [fail(new Error('not found'))])
    await expect(getModuleById('missing')).rejects.toThrow('not found')
  })
})

describe('enrollInModule', () => {
  it('upserts progress and logs activity', async () => {
    queueFromResults(fromMock, [
      ok(null), // smpTable().upsert
      ok({ title: 'Intro to React' }), // getModuleTitle
    ])
    await expect(enrollInModule('mod-1', 'stu-1')).resolves.toBeUndefined()
  })

  it('throws when the upsert errors', async () => {
    queueFromResults(fromMock, [fail(new Error('upsert failed'))])
    await expect(enrollInModule('mod-1', 'stu-1')).rejects.toThrow('upsert failed')
  })
})

describe('updateProgress', () => {
  it('updates progress for the student/module pair', async () => {
    queueFromResults(fromMock, [ok(null)])
    await expect(updateProgress('mod-1', 'stu-1', 50)).resolves.toBeUndefined()
  })

  it('throws on update error', async () => {
    queueFromResults(fromMock, [fail(new Error('update failed'))])
    await expect(updateProgress('mod-1', 'stu-1', 50)).rejects.toThrow('update failed')
  })
})

describe('markAsCompleted', () => {
  it('marks progress complete and logs activity', async () => {
    queueFromResults(fromMock, [
      ok(null), // update
      ok({ title: 'Intro to React' }), // getModuleTitle
    ])
    await expect(markAsCompleted('mod-1', 'stu-1')).resolves.toBeUndefined()
  })
})

describe('createSimpleModule', () => {
  it('inserts and returns the created module', async () => {
    const created = { id: 'mod-1', title: 'New Module' }
    queueFromResults(fromMock, [ok(created)])
    const result = await createSimpleModule('admin-1', {
      title: 'New Module', description: 'desc', difficulty_level: 'beginner', duration_hours: 2,
    }, { text: 'content', attachments: [] })
    expect(result).toEqual(created)
  })
})

describe('updateModuleBasicInfo (RLS-silent-failure detection)', () => {
  it('succeeds when the update affects a row', async () => {
    queueFromResults(fromMock, [{ data: null, error: null, count: 1 } as never])
    await expect(updateModuleBasicInfo('mod-1', { title: 'Updated' })).resolves.toBeUndefined()
  })

  it('throws a descriptive error when zero rows are affected (no error, but no match)', async () => {
    queueFromResults(fromMock, [{ data: null, error: null, count: 0 } as never])
    await expect(updateModuleBasicInfo('mod-1', { title: 'Updated' }))
      .rejects.toThrow(/wasn't found, or you don't have permission/)
  })

  it('throws the underlying error when the update itself errors', async () => {
    queueFromResults(fromMock, [{ data: null, error: new Error('permission denied'), count: null } as never])
    await expect(updateModuleBasicInfo('mod-1', { title: 'Updated' })).rejects.toThrow('permission denied')
  })
})

describe('deleteModule', () => {
  it('deletes the module', async () => {
    queueFromResults(fromMock, [ok(null)])
    await expect(deleteModule('mod-1')).resolves.toBeUndefined()
  })

  it('throws on delete error', async () => {
    queueFromResults(fromMock, [fail(new Error('delete failed'))])
    await expect(deleteModule('mod-1')).rejects.toThrow('delete failed')
  })
})

describe('uploadModuleImage validation', () => {
  it('rejects a disallowed file type before touching storage', async () => {
    const file = new File(['x'], 'doc.gif', { type: 'image/gif' })
    await expect(uploadModuleImage(file, 'admin-1')).rejects.toThrow('Only JPG, PNG, or WEBP images are allowed.')
  })

  it('rejects a file over 5MB before touching storage', async () => {
    const big = new Uint8Array(5 * 1024 * 1024 + 1)
    const file = new File([big], 'big.png', { type: 'image/png' })
    await expect(uploadModuleImage(file, 'admin-1')).rejects.toThrow('Image must be less than 5MB.')
  })
})
