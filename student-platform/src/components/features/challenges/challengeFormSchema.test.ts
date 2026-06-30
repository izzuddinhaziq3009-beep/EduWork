import { describe, it, expect } from 'vitest'
import { challengeSchema } from './challengeFormSchema'

const VALID = {
  title: 'Reduce checkout friction',
  description: 'A description that is definitely twenty characters or more.',
  requirements: 'Requirements that are also at least twenty characters long.',
  difficulty_level: 'beginner' as const,
  deadline: new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 16),
}

describe('challengeSchema', () => {
  it('accepts valid input', () => {
    expect(challengeSchema.safeParse(VALID).success).toBe(true)
  })

  it('rejects a title under 5 characters', () => {
    const result = challengeSchema.safeParse({ ...VALID, title: 'Hi' })
    expect(result.success).toBe(false)
  })

  it('rejects a description under 20 characters', () => {
    const result = challengeSchema.safeParse({ ...VALID, description: 'too short' })
    expect(result.success).toBe(false)
  })

  it('rejects requirements under 20 characters', () => {
    const result = challengeSchema.safeParse({ ...VALID, requirements: 'too short' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid difficulty level', () => {
    const result = challengeSchema.safeParse({ ...VALID, difficulty_level: 'expert' })
    expect(result.success).toBe(false)
  })

  it('rejects a missing deadline', () => {
    const result = challengeSchema.safeParse({ ...VALID, deadline: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a deadline in the past', () => {
    const pastDeadline = new Date(Date.now() - 86_400_000).toISOString().slice(0, 16)
    const result = challengeSchema.safeParse({ ...VALID, deadline: pastDeadline })
    expect(result.success).toBe(false)
  })
})
