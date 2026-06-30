import type { DifficultyLevel } from '@/types'

const CONFIG: Record<DifficultyLevel, { label: string; bg: string; color: string }> = {
  beginner:     { label: 'Beginner',     bg: 'var(--accent-soft)',  color: 'var(--accent)'  },
  intermediate: { label: 'Intermediate', bg: 'var(--warn-soft)',    color: 'var(--warn)'    },
  advanced:     { label: 'Advanced',     bg: 'var(--rose-soft)',    color: 'var(--rose)'    },
}

export function DifficultyBadge({ level }: { level: DifficultyLevel }) {
  const { label, bg, color } = CONFIG[level]
  return (
    <span className="tag" style={{ background: bg, color }}>
      {label}
    </span>
  )
}

