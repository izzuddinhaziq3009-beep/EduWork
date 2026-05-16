import { useAuthStore } from '@/stores/authStore'
import { useOverallProgress, useModuleProgressDetails, useProjectProgressDetails } from '@/hooks/useProgress'
import { SubmissionStatus } from '@/components/features/projects/SubmissionStatus'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'
import { PageHeader } from '@/components/common/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { fmtDate } from '@/utils/formatters'

export function ProgressPage() {
  const { user } = useAuthStore()
  const sid = user?.id ?? ''

  const { data: overall,  isLoading: l1 } = useOverallProgress(sid)
  const { data: modules,  isLoading: l2 } = useModuleProgressDetails(sid)
  const { data: projects, isLoading: l3 } = useProjectProgressDetails(sid)

  const loading = l1 || l2 || l3

  return (
    <div className="p-6 lg:p-8 max-w-[1100px]">
      <PageHeader label="Your journey" title="My Progress" description="Track everything you've completed across modules, projects, and challenges." />

      {/* Summary KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface hairline rounded-2xl p-5"><Skeleton className="h-10 w-full" /></div>
        )) : [
          { label: 'Modules Completed', value: `${overall?.completedModules ?? 0}/${overall?.totalModules ?? 0}`, pct: overall?.modulesPercent ?? 0, color: 'var(--primary)' },
          { label: 'Projects Approved',  value: `${overall?.approvedSubmissions ?? 0}/${overall?.totalSubmissions ?? 0}`, pct: overall?.projectsPercent ?? 0, color: 'var(--accent)' },
          { label: 'Challenges',         value: String(overall?.challengesAttempted ?? 0), pct: null, color: 'var(--warn)' },
          { label: 'Overall Progress',   value: `${Math.round(((overall?.completedModules ?? 0) + (overall?.approvedSubmissions ?? 0)) / Math.max(1, (overall?.totalModules ?? 1) + (overall?.totalSubmissions ?? 1)) * 100)}%`, pct: null, color: 'var(--rose)' },
        ].map(c => (
          <div key={c.label} className="bg-surface hairline rounded-2xl shadow-card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-10 rounded-br-lg" style={{ background: c.color }} />
            <div className="text-[11px] font-mono tracking-wide muted uppercase mb-2">{c.label}</div>
            <div className="font-display text-[36px] leading-none font-semibold">{c.value}</div>
            {c.pct !== null && (
              <div className="pbar mt-3"><span style={{ width: `${c.pct}%`, background: c.color }} /></div>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Module progress */}
        <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
          <div className="px-5 py-4 hairline-b flex items-center justify-between">
            <h2 className="text-[16px] font-semibold">Module progress</h2>
            <span className="font-mono text-[12px] muted">{modules?.length ?? 0} enrolled</span>
          </div>
          <div className="divide-y divide-[var(--hair)]">
            {loading ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-2 w-full" />
              </div>
            )) : modules?.length === 0 ? (
              <div className="px-5 py-8 text-center text-[13px] muted">No modules enrolled yet.</div>
            ) : modules?.map(({ progress, module }) => (
              <div key={progress.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <DifficultyBadge level={module.difficulty_level} />
                    <span className="text-[13.5px] font-medium truncate">{module.title}</span>
                  </div>
                  <span className="font-mono text-[12px] muted shrink-0 ml-2">
                    {progress.completed ? '✓ Done' : `${progress.progress}%`}
                  </span>
                </div>
                <div className="pbar" style={{ height: 6 }}>
                  <span style={{ width: `${progress.progress}%`, background: progress.completed ? 'var(--accent)' : 'var(--primary)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project progress */}
        <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
          <div className="px-5 py-4 hairline-b flex items-center justify-between">
            <h2 className="text-[16px] font-semibold">Project submissions</h2>
            <span className="font-mono text-[12px] muted">{projects?.length ?? 0} submitted</span>
          </div>
          <div className="divide-y divide-[var(--hair)]">
            {loading ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-5 py-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-24" />
              </div>
            )) : projects?.length === 0 ? (
              <div className="px-5 py-8 text-center text-[13px] muted">No submissions yet.</div>
            ) : projects?.map(({ submission, project }) => (
              <div key={submission.id} className="px-5 py-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium truncate">{project.title}</div>
                  <div className="text-[11.5px] muted font-mono mt-0.5">Due {fmtDate(project.due_date)}</div>
                </div>
                <SubmissionStatus status={submission.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
