import { describe, it, expect } from 'vitest'
import { passwordStrength } from './passwordStrength'

describe('passwordStrength', () => {
  it('returns level 0 with no label for an empty string', () => {
    expect(passwordStrength('')).toEqual({ level: 0, label: '' })
  })

  it('scores a too-short, all-lowercase password as level 0', () => {
    expect(passwordStrength('abc')).toEqual({ level: 0, label: 'Too short' })
  })

  it('scores a long, all-lowercase password as level 1', () => {
    expect(passwordStrength('abcdefgh')).toEqual({ level: 1, label: 'Weak' })
  })

  it('scores a long password with mixed case as level 2', () => {
    expect(passwordStrength('abcdefgH')).toEqual({ level: 2, label: 'Okay' })
  })

  it('scores a long password with mixed case and a digit as level 3', () => {
    expect(passwordStrength('abcdefgH1')).toEqual({ level: 3, label: 'Good' })
  })

  it('scores a long password with mixed case, digit, and symbol as level 4', () => {
    expect(passwordStrength('abcdefgH1!')).toEqual({ level: 4, label: 'Strong' })
  })
})
