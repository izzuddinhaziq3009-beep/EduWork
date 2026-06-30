import { describe, it, expect } from 'vitest'
import { portfolioEditorSchema } from './portfolioEditorSchema'

const VALID = {
  title: 'My Portfolio',
  bio: 'A bio that is definitely at least twenty characters long.',
  skills: 'Figma, Python, SQL',
}

describe('portfolioEditorSchema', () => {
  it('accepts valid input', () => {
    expect(portfolioEditorSchema.safeParse(VALID).success).toBe(true)
  })

  it('rejects a title under 3 characters', () => {
    const result = portfolioEditorSchema.safeParse({ ...VALID, title: 'Hi' })
    expect(result.success).toBe(false)
  })

  it('rejects a bio under 20 characters', () => {
    const result = portfolioEditorSchema.safeParse({ ...VALID, bio: 'too short' })
    expect(result.success).toBe(false)
  })

  it('rejects a bio over 600 characters', () => {
    const result = portfolioEditorSchema.safeParse({ ...VALID, bio: 'a'.repeat(601) })
    expect(result.success).toBe(false)
  })

  it('accepts an empty skills string (no skills entered yet)', () => {
    const result = portfolioEditorSchema.safeParse({ ...VALID, skills: '' })
    expect(result.success).toBe(true)
  })
})
