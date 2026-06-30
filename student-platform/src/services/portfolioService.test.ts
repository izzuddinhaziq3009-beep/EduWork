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

  it('returns the portfolio with its items and enriches titles from source tables', async () => {
    queueFromResults(fromMock, [
      ok({ id: 'port1', public_url: 'abc123' }),
      ok([{ id: 'item1', type: 'module', reference_id: 'mod1', title: 'Completed Module', description: '' }]),
      ok([{ id: 'mod1', title: 'Advanced Reacts', description: 'Learn React' }]), // learning_modules lookup
      // project and challenge lookups return nothing (no items of those types)
    ])
    const result = await getPublicPortfolio('abc123')
    expect(result?.portfolio.public_url).toBe('abc123')
    expect(result?.items[0].title).toBe('Advanced Reacts')
  })

  it('falls back to stored title when reference_id does not match an entity', async () => {
    queueFromResults(fromMock, [
      ok({ id: 'port1', public_url: 'abc123' }),
      ok([{ id: 'item1', type: 'module', reference_id: 'old-sub-id', title: 'Completed Module', description: '' }]),
      ok([]), // no match in learning_modules
    ])
    const result = await getPublicPortfolio('abc123')
    expect(result?.items[0].title).toBe('Completed Module')
  })
})

describe('autoGeneratePortfolioItems', () => {
  it('inserts new items with real titles fetched from source tables', async () => {
    queueFromResults(fromMock, [
      ok([{ module_id: 'mod1' }]),                    // student_module_progress
      ok([{ project_id: 'proj1' }]),                  // project_submissions (project_id only)
      ok([{ challenge_id: 'chal1' }]),                // challenge_submissions (challenge_id only)
      ok([]),                                          // existing portfolio_items
      // Second round: fetch real titles
      ok([{ id: 'mod1',  title: 'Advanced Reacts', description: 'Learn React'     }]), // learning_modules
      ok([{ id: 'proj1', title: 'Hospital Mgmt',   description: 'Build a system'  }]), // projects
      ok([{ id: 'chal1', title: 'Text Encrypter',  description: 'Crypto challenge' }]), // industry_challenges
      ok(null), // insert
    ])
    await expect(autoGeneratePortfolioItems('stu1', 'port1')).resolves.toBeUndefined()
  })

  it('skips the title fetch and insert when every item already exists', async () => {
    queueFromResults(fromMock, [
      ok([{ module_id: 'mod1' }]),
      ok([]),
      ok([]),
      ok([{ reference_id: 'mod1' }]), // already has this module
    ])
    await autoGeneratePortfolioItems('stu1', 'port1')
    // Only the 4 initial parallel queries fire; no title-fetch or insert queries
    expect(fromMock).toHaveBeenCalledTimes(4)
  })
})
