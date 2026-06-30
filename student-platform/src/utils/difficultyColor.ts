import type { DifficultyLevel } from '@/types'

export function difficultyColor(level: DifficultyLevel): string {
  return { beginner: 'var(--accent)', intermediate: 'var(--warn)', advanced: 'var(--rose)' }[level]
}
