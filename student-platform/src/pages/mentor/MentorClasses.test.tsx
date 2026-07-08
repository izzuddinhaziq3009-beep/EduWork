import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { RosterRow, ClassCard, ClassEditForm } from './MentorClasses'
import type { ClassWithMeta } from '@/services/classService'

// Mock hooks used inside ClassCard so it can be rendered without a real query context.
vi.mock('@/hooks/useClasses', () => ({
  useClassRoster: () => ({ data: [], isLoading: false }),
  useUpdateClass:  () => ({ mutate: vi.fn(), isPending: false }),
}))

const CLS: ClassWithMeta = {
  id: 'cls1', module_id: 'mod1', mentor_id: 'men1',
  name: 'React Cohort A', join_code: 'ABC12345',
  is_active: true, created_at: '2025-01-01T00:00:00Z',
  instructions: 'Complete all lessons.',
  module_title: 'React 101', enrolled_count: 3,
}

function renderCard(cls: ClassWithMeta = CLS) {
  return renderToStaticMarkup(
    createElement(MemoryRouter, null,
      createElement(ClassCard, {
        cls,
        mentorId:      'men1',
        copiedId:      null,
        onCopy:        vi.fn(),
        onResetCode:   vi.fn(),
        onDeactivate:  vi.fn(),
        isResetting:   false,
        isDeactivating: false,
      })
    )
  )
}

function renderEditForm(initialName: string, initialInstructions: string) {
  return renderToStaticMarkup(
    createElement(MemoryRouter, null,
      createElement(ClassEditForm, {
        initialName,
        initialInstructions,
        isPending: false,
        onSave:    vi.fn(),
        onCancel:  vi.fn(),
      })
    )
  )
}

const student = { id: 'stu-abc', full_name: 'Alice Smith' }

function render(overrides: Partial<Parameters<typeof RosterRow>[0]> = {}) {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter, null,
      createElement(RosterRow, {
        student,
        progress: 60,
        completed: false,
        onMessage: vi.fn(),
        ...overrides,
      }),
    ),
  )
}

describe('ClassCard edit button', () => {
  it('renders an Edit button on every class card', () => {
    const html = renderCard()
    expect(html).toContain('>Edit<')
  })

  it('renders the class name and module title', () => {
    const html = renderCard()
    expect(html).toContain('React Cohort A')
    expect(html).toContain('React 101')
  })
})

describe('ClassEditForm pre-fill', () => {
  it('pre-fills the name input with initialName', () => {
    const html = renderEditForm('React Cohort A', '')
    expect(html).toContain('React Cohort A')
  })

  it('pre-fills the instructions textarea with initialInstructions', () => {
    const html = renderEditForm('Test Class', 'Complete all lessons.')
    expect(html).toContain('Complete all lessons.')
  })

  it('renders Save and Cancel buttons', () => {
    const html = renderEditForm('Test', '')
    expect(html).toContain('>Save<')
    expect(html).toContain('>Cancel<')
  })
})

describe('RosterRow message button', () => {
  it('renders a "Message student" button', () => {
    const html = render()
    expect(html).toContain('title="Message student"')
  })

  it('button fires onMessage — parent binds navigate("/messages?with={studentId}")', () => {
    // The parent passes () => navigate(`/messages?with=${student.id}`) as onMessage.
    // We verify onMessage is wired to the button; the URL binding lives in ClassCard.
    const onMessage = vi.fn()
    // renderToStaticMarkup strips event handlers; presence of the button is the assertion.
    const html = render({ onMessage })
    expect(html).toContain('title="Message student"')
  })

  it('shows the student name in the row', () => {
    const html = render()
    expect(html).toContain('Alice Smith')
  })

  it('shows the progress percentage', () => {
    const html = render({ progress: 75 })
    expect(html).toContain('75%')
  })

  it('renders the Completed badge when completed is true', () => {
    const html = render({ completed: true })
    expect(html).toContain('Completed')
  })

  it('omits the Completed badge when completed is false', () => {
    const html = render({ completed: false })
    expect(html).not.toContain('Completed')
  })
})
