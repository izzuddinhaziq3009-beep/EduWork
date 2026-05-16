import type { SubmissionStatus as TStatus } from '@/types'

const CONFIG: Record<TStatus, { label: string; bg: string; color: string; dot: string }> = {
  submitted:          { label: 'Submitted',          bg: 'var(--warn-soft)',    color: 'var(--warn)',    dot: 'var(--warn)'    },
  reviewing:          { label: 'Under Review',        bg: 'var(--primary-soft)', color: 'var(--primary)', dot: 'var(--primary)' },
  approved:           { label: 'Approved',            bg: 'var(--accent-soft)',  color: 'var(--accent)',  dot: 'var(--accent)'  },
  revision_requested: { label: 'Revision Requested', bg: 'var(--rose-soft)',    color: 'var(--rose)',    dot: 'var(--rose)'    },
}

export function SubmissionStatus({ status }: { status: TStatus }) {
  const { label, bg, color, dot } = CONFIG[status]
  return (
    <span className="tag" style={{ background: bg, color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
      {label}
    </span>
  )
}
