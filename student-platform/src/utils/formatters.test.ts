import { describe, it, expect } from 'vitest'
import { fmtDate, fmtDateTime, fmtRelative, fmtDuration, fmtInitials } from './formatters'

describe('fmtDate', () => {
  it('formats an ISO date as "MMM d, yyyy"', () => {
    expect(fmtDate('2026-03-05T00:00:00.000Z')).toBe('Mar 5, 2026')
  })
})

describe('fmtDateTime', () => {
  it('formats an ISO date with a time component', () => {
    expect(fmtDateTime('2026-03-05T14:30:00.000Z')).toMatch(/^Mar 5, 2026 · \d{1,2}:\d{2} [AP]M$/)
  })
})

describe('fmtRelative', () => {
  it('formats a far-past date as a relative "ago" string', () => {
    expect(fmtRelative('2000-01-01T00:00:00.000Z')).toMatch(/ago$/)
  })
})

describe('fmtDuration', () => {
  it('formats sub-hour durations in minutes', () => {
    expect(fmtDuration(0.5)).toBe('30m')
  })

  it('formats exactly 1 hour as "1h"', () => {
    expect(fmtDuration(1)).toBe('1h')
  })

  it('formats multi-hour durations in hours', () => {
    expect(fmtDuration(3)).toBe('3h')
  })
})

describe('fmtInitials', () => {
  it('takes the first letter of up to two words, uppercased', () => {
    expect(fmtInitials('Ada Lovelace')).toBe('AL')
  })

  it('handles a single-word name', () => {
    expect(fmtInitials('Cher')).toBe('C')
  })

  it('truncates names with more than two words to the first two initials', () => {
    expect(fmtInitials('Mary Jane Watson')).toBe('MJ')
  })
})
