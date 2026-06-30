import { describe, it, expect } from 'vitest'
import { projectSubmissionSchema } from './projectSubmissionSchema'

describe('projectSubmissionSchema', () => {
  it('accepts content of 20+ characters', () => {
    const result = projectSubmissionSchema.safeParse({
      content: 'I built a small app to track my daily habits.',
    })
    expect(result.success).toBe(true)
  })

  it('rejects content under 20 characters', () => {
    const result = projectSubmissionSchema.safeParse({ content: 'too short' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty string', () => {
    const result = projectSubmissionSchema.safeParse({ content: '' })
    expect(result.success).toBe(false)
  })
})
