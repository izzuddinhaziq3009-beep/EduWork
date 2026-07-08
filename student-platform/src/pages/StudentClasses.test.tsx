import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { ClassBlock } from './StudentClasses'
import type { StudentClassRow } from '@/services/classService'

const base: StudentClassRow = {
  classId:           'cls1',
  className:         'React Cohort A',
  moduleId:          'mod1',
  moduleTitle:       'React 101',
  moduleDescription: 'Learn React fundamentals.',
  difficultyLevel:   'beginner',
  durationHours:     4,
  moduleImageUrl:    null,
  moduleColor:       null,
  mentorId:          'men1',
  mentorName:        'Dr. Smith',
  progress:          50,
  completed:         false,
  classmatesCount:   3,
  instructions:      null,
}

function render(row: StudentClassRow) {
  return renderToStaticMarkup(
    createElement(MemoryRouter, null, createElement(ClassBlock, { row })),
  )
}

describe('ClassBlock instructions', () => {
  it('shows instructions when present', () => {
    const html = render({ ...base, instructions: 'Complete all lessons, pass the quiz, then submit.' })
    expect(html).toContain('Complete all lessons, pass the quiz, then submit.')
  })

  it('omits the instructions element when null', () => {
    const html = render({ ...base, instructions: null })
    expect(html).not.toContain('Complete all lessons')
  })

  it('renders the class name and module title regardless', () => {
    const html = render(base)
    expect(html).toContain('React Cohort A')
    expect(html).toContain('React 101')
  })
})
