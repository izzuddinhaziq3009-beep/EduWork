import { Link } from 'react-router-dom'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { fmtDuration } from '@/utils/formatters'
import { resolveModuleColor } from '@/utils/moduleColors'
import { difficultyColor } from '@/utils/difficultyColor'
import type { LearningModule, StudentModuleProgress } from '@/types'

const PATTERNS: Record<string, string> = {
  beginner:     'repeating-linear-gradient(135deg, rgba(255,255,255,0.18) 0 14px, transparent 14px 28px)',
  intermediate: 'radial-gradient(rgba(255,255,255,0.22) 1.5px, transparent 1.6px) 0 0/14px 14px',
  advanced:     'linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px) 0 0/22px 22px, linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px) 0 0/22px 22px',
}

interface Props {
  module: LearningModule
  progress?: StudentModuleProgress
  onEnroll?: () => void
  enrolling?: boolean
}

export function ModuleCard({ module, progress, onEnroll, enrolling }: Props) {
  const color = resolveModuleColor(module.module_color) ?? difficultyColor(module.difficulty_level)
  const hasImage = !!module.module_image_url
  const pct   = progress?.progress ?? 0
  const enrolled = !!progress
  const completed = progress?.completed

  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden flex flex-col hover:shadow-pop transition-shadow">
      {/* Coloured / image header */}
      <div className="h-[140px] relative" style={{ background: color }}>
        {hasImage ? (
          <>
            <div className="absolute inset-0" style={{ backgroundImage: `url(${module.module_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            {/* Semi-transparent color overlay keeps badges/text readable over arbitrary images */}
            <div className="absolute inset-0" style={{ background: color, opacity: 0.35 }} />
          </>
        ) : (
          <div className="absolute inset-0" style={{ backgroundImage: PATTERNS[module.difficulty_level] }} />
        )}
        <div className="absolute inset-0 p-4 flex flex-col justify-between text-white" style={hasImage ? { textShadow: '0 1px 3px rgba(0,0,0,0.55)' } : undefined}>
          <DifficultyBadge level={module.difficulty_level} />
          <div className="flex items-end justify-between">
            {/* Mini ring */}
            <Ring pct={pct} />
            {completed && (
              <span className="w-9 h-9 rounded-full bg-white grid place-items-center shadow-md" style={{ color }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7" />
                </svg>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div>
          <div className="text-[11px] font-mono muted uppercase tracking-wide">
            {fmtDuration(module.duration_hours)} · {module.difficulty_level}
          </div>
          <h3 className="text-[16px] font-semibold leading-snug mt-1 line-clamp-2">{module.title}</h3>
          <p className="text-[13px] muted mt-1 line-clamp-2">{module.description}</p>
        </div>

        {/* Progress bar (if enrolled) */}
        {enrolled && (
          <div>
            <div className="pbar"><span style={{ width: `${pct}%` }} /></div>
            <div className="flex justify-between mt-1.5 text-[11px] font-mono muted">
              <span>{pct}% complete</span>
              {completed && <span style={{ color: 'var(--accent)' }}>✓ Done</span>}
            </div>
          </div>
        )}

        <div className="mt-auto flex gap-2">
          {enrolled ? (
            <Link to={`/modules/${module.id}`}
              className="flex-1 h-9 rounded-xl flex items-center justify-center text-[13px] font-semibold text-white"
              style={{ background: color }}>
              {completed ? 'Review' : 'Continue'}
            </Link>
          ) : (
            <button onClick={onEnroll} disabled={enrolling}
              className="flex-1 h-9 rounded-xl hairline flex items-center justify-center text-[13px] font-semibold hover:bg-[var(--hair-2)] disabled:opacity-60 transition-colors">
              {enrolling ? 'Enrolling…' : 'Enroll'}
            </button>
          )}
          <Link to={`/modules/${module.id}`}
            className="h-9 px-3 rounded-xl hairline flex items-center text-[13px] muted hover:bg-[var(--hair-2)] transition-colors">
            View
          </Link>
        </div>
      </div>
    </div>
  )
}

function Ring({ pct }: { pct: number }) {
  const r = 18, size = 44, stroke = 4
  const c = 2 * Math.PI * r
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.25)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#fff" strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`} />
      </svg>
      <div className="absolute font-mono font-semibold text-white" style={{ fontSize: 11 }}>{pct}%</div>
    </div>
  )
}

export function ModuleCardSkeleton() {
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      <Skeleton className="h-[140px] w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </div>
  )
}
