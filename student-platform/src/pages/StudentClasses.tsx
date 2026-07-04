import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useStudentClasses } from '@/hooks/useClasses'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { fmtDuration, fmtInitials } from '@/utils/formatters'
import { resolveModuleColor } from '@/utils/moduleColors'
import { difficultyColor } from '@/utils/difficultyColor'
import { JoinWithCodeCard } from '@/components/features/classes/JoinWithCodeCard'
import type { StudentClassRow } from '@/services/classService'

// ── header texture patterns — identical to ModuleCard ─────────────────────────
const PATTERNS: Record<string, string> = {
  beginner:     'repeating-linear-gradient(135deg, rgba(255,255,255,0.18) 0 14px, transparent 14px 28px)',
  intermediate: 'radial-gradient(rgba(255,255,255,0.22) 1.5px, transparent 1.6px) 0 0/14px 14px',
  advanced:     'linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px) 0 0/22px 22px, linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px) 0 0/22px 22px',
}

const AVATAR_COLORS = ['#0F4C5C', '#2C9D6E', '#C97A2D', '#B8456A', '#3B6AC9']
function avatarBg(name: string) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] }

// ── progress ring — identical to ModuleCard ───────────────────────────────────
function Ring({ pct }: { pct: number }) {
  const r = 18, size = 44, stroke = 4, c = 2 * Math.PI * r
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

// ── status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ pct, completed }: { pct: number; completed: boolean }) {
  if (completed || pct >= 100) return (
    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      Completed
    </span>
  )
  if (pct === 0) return (
    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
      style={{ background: 'var(--hair-2)', color: 'var(--ink-3)' }}>
      Not started
    </span>
  )
  return (
    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
      style={{ background: 'var(--warn-soft)', color: 'var(--warn)' }}>
      In progress
    </span>
  )
}

// ── ClassBlock: single white card — header + divider + module content ─────────
function ClassBlock({ row }: { row: StudentClassRow }) {
  const navigate = useNavigate()
  const pct      = Math.min(100, Math.max(0, Math.round(row.progress)))
  const color    = resolveModuleColor(row.moduleColor) ?? difficultyColor(row.difficultyLevel)
  const hasImage = !!row.moduleImageUrl
  const done     = row.completed || pct >= 100

  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden flex flex-col hover:shadow-pop transition-shadow">

      {/* ── 1. Header section ────────────────────────────────────────────── */}
      <div className="px-5 py-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[20px] font-bold leading-tight line-clamp-1">{row.className}</h2>
          <p className="text-[13px] muted mt-0.5 line-clamp-1">{row.moduleTitle}</p>
        </div>
        <button
          onClick={() => navigate(`/modules/${row.moduleId}`)}
          className="shrink-0 h-9 px-4 rounded-xl text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: 'var(--primary)' }}>
          Continue
        </button>
      </div>

      {/* ── Thin divider ─────────────────────────────────────────────────── */}
      <div className="hairline-t" />

      {/* ── 2. Module content ─────────────────────────────────────────────── */}

      {/* Coloured / image thumbnail */}
      <div className="h-[140px] relative" style={{ background: color }}>
        {hasImage ? (
          <>
            <div className="absolute inset-0"
              style={{ backgroundImage: `url(${row.moduleImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div className="absolute inset-0" style={{ background: color, opacity: 0.35 }} />
          </>
        ) : (
          <div className="absolute inset-0" style={{ backgroundImage: PATTERNS[row.difficultyLevel] }} />
        )}
        <div className="absolute inset-0 p-4 flex flex-col justify-between text-white"
          style={hasImage ? { textShadow: '0 1px 3px rgba(0,0,0,0.55)' } : undefined}>
          <div><DifficultyBadge level={row.difficultyLevel} /></div>
          <div className="flex items-end justify-between">
            <Ring pct={pct} />
            {done && (
              <span className="w-9 h-9 rounded-full bg-white grid place-items-center shadow-md" style={{ color }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                  strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7" />
                </svg>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 flex-1 flex flex-col gap-3">

        {/* Module meta: duration · difficulty, then module title + description */}
        <div>
          <div className="text-[11px] font-mono muted uppercase tracking-wide">
            {fmtDuration(row.durationHours)} · {row.difficultyLevel}
          </div>
          <h3 className="text-[16px] font-semibold leading-snug mt-1 line-clamp-2">{row.moduleTitle}</h3>
          <p className="text-[13px] muted mt-1 line-clamp-2">{row.moduleDescription}</p>
        </div>

        {/* Progress bar + status badge */}
        <div>
          <div className="pbar"><span style={{ width: `${pct}%` }} /></div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[11px] font-mono muted">{pct}% complete</span>
            <StatusBadge pct={pct} completed={row.completed} />
          </div>
        </div>

        {/* Classmate count */}
        <div className="text-[12px] muted flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
            strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="8" r="3.5"/><path d="M2 21c.7-3.6 3.6-5.5 7-5.5s6.3 1.9 7 5.5"/>
            <circle cx="17" cy="6" r="2.5"/><path d="M15.5 14.5c2.8.3 5.1 1.9 6.5 4.5"/>
          </svg>
          {row.classmatesCount} student{row.classmatesCount !== 1 ? 's' : ''} in this class
        </div>

        {/* Footer: mentor avatar + name + Message (no Continue here) */}
        <div className="mt-auto pt-3 hairline-t flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg grid place-items-center text-[11px] font-mono font-semibold text-white shrink-0"
            style={{ background: avatarBg(row.mentorName) }}>
            {fmtInitials(row.mentorName)}
          </div>
          <span className="flex-1 text-[13px] font-medium truncate">{row.mentorName}</span>
          <button
            onClick={() => navigate(`/messages?with=${row.mentorId}`)}
            className="h-8 px-3 rounded-lg text-[12px] font-semibold hairline hover:bg-[var(--hair-2)] transition-colors shrink-0">
            Message
          </button>
        </div>

      </div>
    </div>
  )
}

// ── Loading skeleton (single card shape) ─────────────────────────────────────
function ClassBlockSkeleton() {
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      {/* Header skeleton */}
      <div className="px-5 py-4 flex items-center justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-9 w-24 rounded-xl shrink-0" />
      </div>
      {/* Divider */}
      <div className="hairline-t" />
      {/* Module content skeleton */}
      <Skeleton className="h-[140px] w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="pt-3 hairline-t flex items-center gap-2.5">
          <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
        </div>
      </div>
    </div>
  )
}

// ── ClassesTabContent — content only, no page wrapper ────────────────────────
export function ClassesTabContent() {
  const { user } = useAuthStore()
  const { data: classes = [], isLoading } = useStudentClasses(user?.id ?? '')

  return (
    <>
      {/* Join with code */}
      <div className="mb-8 max-w-md">
        <div className="font-mono text-[11px] tracking-[0.16em] muted uppercase mb-2">
          Join a class with a code
        </div>
        <JoinWithCodeCard />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <ClassBlockSkeleton key={i} />)}
        </div>
      ) : classes.length === 0 ? (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
              strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
          }
          title="You haven't joined any classes yet"
          description="Enter a class code from the Learning hub to join one."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(row => <ClassBlock key={row.classId} row={row} />)}
        </div>
      )}
    </>
  )
}

// ── StudentClasses page ────────────────────────────────────────────────────────
export function StudentClasses() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <PageHeader
        label="Your enrolled classes"
        title="My Classes"
        description="Classes you've joined through a mentor's invite code."
      />
      <ClassesTabContent />
    </div>
  )
}
