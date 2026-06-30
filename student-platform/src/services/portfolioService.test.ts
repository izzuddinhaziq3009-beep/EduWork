import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { ok, queueFromResults } from '@/test/supabaseMock'

vi.mock('./supabase', () => ({ supabase: { from: vi.fn() } }))

import { supabase } from './supabase'
import {
  getStudentPortfolio, createPortfolio, updatePortfolio, togglePublic,
  getPublicPortfolio, autoGeneratePortfolioItems,
} from './portfolioService'

const fromMock = supabase.from as Mock

beforeEach(() => {
  fromMock.mockReset()
})

describe('getStudentPortfolio', () => {
  it('returns null when the student has no portfolio yet', async () => {
    queueFromResults(fromMock, [ok(null)])
    expect(await getStudentPortfolio('stu1')).toBeNull()
    expect(fromMock).toHaveBeenCalledTimes(1)
  })

  it('returns the portfolio with its items', async () => {
    queueFromResults(fromMock, [
      ok({ id: 'port1', student_id: 'stu1' }),
      ok([{ id: 'item1', portfolio_id: 'port1' }]),
    ])
    const result = await getStudentPortfolio('stu1')
    expect(result?.portfolio.id).toBe('port1')
    expect(result?.items).toHaveLength(1)
  })
})

describe('createPortfolio', () => {
  it('creates and returns the portfolio', async () => {
    queueFromResults(fromMock, [ok({ id: 'port1', title: 'My Portfolio' })])
    const result = await createPortfolio('stu1', { title: 'My Portfolio', bio: 'bio', skills: ['React'] })
    expect(result.title).toBe('My Portfolio')
  })
})

describe('updatePortfolio', () => {
  it('updates the portfolio fields', async () => {
    queueFromResults(fromMock, [ok(null)])
    await expect(updatePortfolio('port1', { title: 'Updated' })).resolves.toBeUndefined()
  })
})

describe('togglePublic', () => {
  it('sets a public_url derived from the portfolio id when made public', async () => {
    queueFromResults(fromMock, [ok(null)])
    await expect(togglePublic('port1234-rest', true)).resolves.toBeUndefined()
  })

  it('clears public_url when made private', async () => {
    queueFromResults(fromMock, [ok(null)])
    await expect(togglePublic('port1234-rest', false)).resolves.toBeUndefined()
  })
})

describe('getPublicPortfolio', () => {
  it('returns null when no public portfolio matches the url', async () => {
    queueFromResults(fromMock, [ok(null)])
    expect(await getPublicPortfolio('nope')).toBeNull()
  })

  it('returns the portfolio with its items', async () => {
    queueFromResults(fromMock, [
      ok({ id: 'port1', public_url: 'abc123' }),
      ok([{ id: 'item1' }]),
    ])
    const result = await getPublicPortfolio('abc123')
    expect(result?.portfolio.public_url).toBe('abc123')
  })
})

describe('autoGeneratePortfolioItems', () => {
  it('inserts new items for completed modules/projects/challenges not already present', async () => {
    queueFromResults(fromMock, [
      ok([{ module_id: 'mod1' }]),
      ok([{ id: 'sub1', project_id: 'proj1' }]),
      ok([{ id: 'chal1' }]),
      ok([]), // existing items
      ok(null), // insert
    ])
    await expect(autoGeneratePortfolioItems('stu1', 'port1')).resolves.toBeUndefined()
  })

  it('skips the insert call when every item already exists', async () => {
    queueFromResults(fromMock, [
      ok([{ module_id: 'mod1' }]),
      ok([]),
      ok([]),
      ok([{ reference_id: 'mod1' }]), // already has this module
    ])
    await autoGeneratePortfolioItems('stu1', 'port1')
    expect(fromMock).toHaveBeenCalledTimes(4)
  })
})
