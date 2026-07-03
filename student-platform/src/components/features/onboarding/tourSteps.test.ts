import { describe, it, expect } from 'vitest'
import { tourStepsForRole } from './tourSteps'

describe('tourStepsForRole', () => {
  it('returns 11 student steps starting with modules', () => {
    const steps = tourStepsForRole('student')
    expect(steps).toHaveLength(11)
    expect(steps[0].target).toBe('[data-tour="modules"]')
    expect(steps[1].target).toBe('[data-tour="classes"]')
  })

  it('includes all required student sidebar items', () => {
    const targets = tourStepsForRole('student').map(s => s.target as string)
    expect(targets).toContain('[data-tour="modules"]')
    expect(targets).toContain('[data-tour="classes"]')
    expect(targets).toContain('[data-tour="projects"]')
    expect(targets).toContain('[data-tour="progress"]')
    expect(targets).toContain('[data-tour="mentorship"]')
    expect(targets).toContain('[data-tour="portfolio"]')
    expect(targets).toContain('[data-tour="certificates"]')
    expect(targets).toContain('[data-tour="independent-projects"]')
    expect(targets).toContain('[data-tour="challenges"]')
    expect(targets).toContain('[data-tour="messages"]')
  })

  it('returns 5 mentor steps starting with classes', () => {
    const steps = tourStepsForRole('mentor')
    expect(steps).toHaveLength(5)
    expect(steps[0].target).toBe('[data-tour="classes"]')
    const targets = steps.map(s => s.target as string)
    expect(targets).toContain('[data-tour="submissions"]')
    expect(targets).toContain('[data-tour="requests"]')
    expect(targets).toContain('[data-tour="messages"]')
  })

  it('returns 5 company steps starting with post-challenge', () => {
    const steps = tourStepsForRole('company')
    expect(steps).toHaveLength(5)
    expect(steps[0].target).toBe('[data-tour="post-challenge"]')
    const targets = steps.map(s => s.target as string)
    expect(targets).toContain('[data-tour="my-challenges"]')
    expect(targets).toContain('[data-tour="submissions"]')
    expect(targets).toContain('[data-tour="messages"]')
  })

  it('returns 5 admin steps starting with users', () => {
    const steps = tourStepsForRole('admin')
    expect(steps).toHaveLength(5)
    expect(steps[0].target).toBe('[data-tour="users"]')
    const targets = steps.map(s => s.target as string)
    expect(targets).toContain('[data-tour="content"]')
    expect(targets).toContain('[data-tour="moderation"]')
    expect(targets).toContain('[data-tour="monitoring"]')
  })

  it('sets skipBeacon on every first step', () => {
    for (const role of ['student', 'mentor', 'company', 'admin'] as const) {
      const steps = tourStepsForRole(role)
      expect(steps[0].skipBeacon).toBe(true)
    }
  })

  it('ends every role tour on the profile-menu step', () => {
    for (const role of ['student', 'mentor', 'company', 'admin'] as const) {
      const steps = tourStepsForRole(role)
      const last = steps[steps.length - 1]
      expect(last.target).toBe('[data-tour="profile-menu"]')
      expect(last.placement).toBe('bottom')
    }
  })
})
