import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { ProjectCard } from './ProjectCard'
import type { Project } from '@/types'

const base: Project = {
  id: 'p1',
  title: 'Build a REST API',
  description: 'Create a RESTful API with authentication.',
  requirements: 'Use Node.js and Express.',
  due_date: '2030-01-01T00:00:00Z',
  module_id: null,
  created_by: 'mentor-1',
  created_at: '2024-01-01T00:00:00Z',
  is_active: true,
  module: null,
}

function render(project: Project) {
  return renderToStaticMarkup(
    createElement(MemoryRouter, null, createElement(ProjectCard, { project })),
  )
}

describe('ProjectCard due date / no-deadline', () => {
  it('shows the due date when due_date is set', () => {
    const html = render({ ...base, due_date: '2030-06-15T00:00:00Z' })
    expect(html).toContain('Due')
    expect(html).not.toContain('No deadline')
  })

  it('omits the deadline element when due_date is null', () => {
    const html = render({ ...base, due_date: null })
    expect(html).not.toContain('No deadline')
    expect(html).not.toContain('Due ')
  })
})

describe('ProjectCard module badge', () => {
  it('shows the module name when module is present', () => {
    const html = render({ ...base, module: { id: 'm1', title: 'Building Web Apps with React' } })
    expect(html).toContain('Module: Building Web Apps with React')
  })

  it('does not render a module badge when module is null', () => {
    const html = render({ ...base, module: null })
    expect(html).not.toContain('Module:')
  })

  it('does not render a module badge when module property is absent', () => {
    const html = render(base)
    expect(html).not.toContain('Module:')
  })
})
