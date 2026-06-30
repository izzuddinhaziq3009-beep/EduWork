import { describe, it, expect } from 'vitest'
import { mentorshipRequestSchema } from './mentorshipRequestSchema'

describe('mentorshipRequestSchema', () => {
  it('accepts a message of 20+ characters', () => {
    const result = mentorshipRequestSchema.safeParse({
      message: 'Hi! I would love your guidance on product design.',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an undefined message with a string-type error, not a custom-message bypass', () => {
    const result = mentorshipRequestSchema.safeParse({ message: undefined })
    expect(result.success).toBe(false)
  })

  it('rejects a message under 20 characters', () => {
    const result = mentorshipRequestSchema.safeParse({ message: 'too short' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Please write at least 20 characters.')
    }
  })

  it('rejects a message over 500 characters', () => {
    const result = mentorshipRequestSchema.safeParse({ message: 'a'.repeat(501) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Keep it under 500 characters.')
    }
  })

  it('accepts a message of exactly 500 characters', () => {
    const result = mentorshipRequestSchema.safeParse({ message: 'a'.repeat(500) })
    expect(result.success).toBe(true)
  })
})
