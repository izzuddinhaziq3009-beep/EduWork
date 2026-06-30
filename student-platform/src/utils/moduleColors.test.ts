import { describe, it, expect } from 'vitest'
import { resolveModuleColor, MODULE_COLOR_OPTIONS } from './moduleColors'

describe('resolveModuleColor', () => {
  it('returns null for null/undefined input', () => {
    expect(resolveModuleColor(null)).toBeNull()
    expect(resolveModuleColor(undefined)).toBeNull()
  })

  it('returns null for an empty string', () => {
    expect(resolveModuleColor('')).toBeNull()
  })

  it('passes through a literal hex color unchanged', () => {
    expect(resolveModuleColor('#123ABC')).toBe('#123ABC')
  })

  it('resolves a known preset name to its hex value', () => {
    const cyan = MODULE_COLOR_OPTIONS.find(c => c.value === 'cyan')!
    expect(resolveModuleColor('cyan')).toBe(cyan.hex)
  })

  it('returns null for an unknown preset name', () => {
    expect(resolveModuleColor('not-a-real-color')).toBeNull()
  })
})
