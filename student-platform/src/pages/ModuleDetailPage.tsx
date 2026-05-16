import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useModule, useProgressForModule, useEnrollModule, useUpdateProgress, useCompleteModule } from '@/hooks/useModules'
import { ModuleContent } from '@/components/features/modules/ModuleContent'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { fmtDuration } from '@/utils/formatters'

export function ModuleDetailPage() {
  const { id = '' } = useParams()
  const { user } = useAuthStore()
  const [progressVal, setProgressVal] = useState<number | null>(null)

  const { data: module,   isLoading: loadingModule   } = useModule(id)
  const { data: progress, isLoading: loadingProgress } = useProgressForModule(id, user?.id ?? '')

  const enroll       = useEnrollModule()
  const updateProg   = useUpdateProgress()
  const completeModule = useCompleteModule()

  const enrolled  = !!progress
  const completed = progress?.completed
  const pct       = progressVal ?? progress?.progress ?? 0

  if (loadingModule || loadingProgress) {
    return (
      <div className="p-6 lg:p-8 max-w-[900px]">
        <Skeleton className="h-4 w-24 mb-6" />
        <Skeleton className="h-9 w-2/3 mb-3" />
        <Skeleton className="h-4 w-full mb-8" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!module) return <div className="p-8 muted">Module not found.</div>

  return (
    <div className="p-6 lg:p-8 max-w-[900px]">
      <Link to="/modules" className="text-[13px] font-medium flex items-center gap-1.5 mb-6"
        style={{ color: 'var(--primary)' }}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to modules
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <DifficultyBadge level={module.difficulty_level} />
          <span className="tag" style={{ background: 'var(--hair-2)', color: 'var(--ink-2)' }}>
            {fmtDuration(module.duration_hours)}
          </span>
        </div>
        <h1 className="font-display text-[32px] font-semibold tracking-tight leading-tight mb-2">{module.title}</h1>
        <p className="text-[15px] muted leading-relaxed">{module.description}</p>
      </div>

      {/* Enrollment / progress bar */}
      <div className="bg-surface hairline rounded-2xl p-5 mb-8">
        {!enrolled ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[15px] font-semibold">Ready to start?</div>
              <div className="text-[13px] muted mt-0.5">Enroll to track your progress and earn this module in your portfolio.</div>
            </div>
            <button onClick={() => user && enroll.mutate({ moduleId: id, studentId: user.id })}
              disabled={enroll.isPending}
              className="shrink-0 h-10 px-5 rounded-xl text-[13.5px] font-semibold text-white disabled:opacity-70 transition-opacity"
              style={{ background: 'var(--primary)' }}>
              {enroll.isPending ? 'Enrolling…' : 'Enroll now'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-semibold">Your progress</span>
              <span className="font-mono muted">{pct}%</span>
            </div>
            <div className="pbar teal" style={{ height: 8 }}>
              <span style={{ width: `${pct}%` }} />
            </div>
            {!completed && (
              <div className="flex items-center gap-3">
                <input type="range" min={0} max={100} value={pct}
                  onChange={e => setProgressVal(Number(e.target.value))}
                  className="flex-1 accent-[var(--accent)]" />
                <button
                  onClick={() => {
                    if (!user) return
                    if (progressVal !== null) updateProg.mutate({ moduleId: id, studentId: user.id, progress: pct })
                  }}
                  disabled={updateProg.isPending || progressVal === null}
                  className="h-8 px-3 rounded-lg text-[12.5px] font-semibold hairline hover:bg-[var(--hair-2)] disabled:opacity-50">
                  Save
                </button>
              </div>
            )}
            {!completed && pct >= 80 && (
              <button
                onClick={() => user && completeModule.mutate({ moduleId: id, studentId: user.id })}
                disabled={completeModule.isPending}
                className="w-full h-10 rounded-xl text-[13.5px] font-semibold text-white disabled:opacity-70"
                style={{ background: 'var(--accent)' }}>
                {completeModule.isPending ? 'Marking…' : '✓ Mark as completed'}
              </button>
            )}
            {completed && (
              <div className="flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>
                <span className="text-[13.5px] font-semibold">Module completed</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-surface hairline rounded-2xl p-6 lg:p-8">
        <h2 className="font-display text-[22px] font-semibold tracking-tight mb-6">Module content</h2>
        <ModuleContent content={module.content as Record<string, unknown>} />
      </div>
    </div>
  )
}
