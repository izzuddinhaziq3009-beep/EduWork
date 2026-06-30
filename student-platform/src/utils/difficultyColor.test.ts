import { describe, it, expect } from 'vitest'
import { difficultyColor } from './difficultyColor'

describe('difficultyColor', () => {
  it('returns the accent color for beginner', () => {
    expect(difficultyColor('beginner')).toBe('var(--accent)')
  })

  it('returns the warn color for intermediate', () => {
    expect(difficultyColor('intermediate')).toBe('var(--warn)')
  })

  it('returns the rose color for advanced', () => {
    expect(difficultyColor('advanced')).toBe('var(--rose)')
  })
})
