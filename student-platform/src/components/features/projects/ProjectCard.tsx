import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { SubmissionStatus } from './SubmissionStatus'
import { fmtDate, fmtRelative } from '@/utils/formatters'
import type { Project, ProjectSubmission } from '@/types'

interface Props {
  project: Project
  submission?: ProjectSubmission
}

export function ProjectCard({ project, submission }: Props) {
  const isPast = new Date(project.due_date) < new Date()

  return (
    <div className="bg-surface hairline rounded-2xl shadow-card p-5 flex flex-col gap-4 hover:shadow-pop transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-semibold leading-snug line-clamp-2">{project.title}</h3>
          <p className="text-[13px] muted mt-1 line-clamp-2">{project.description}</p>
        </div>
        {submission && <SubmissionStatus status={submission.status} />}
      </div>

      <div className="flex items-center gap-3 text-[12px] font-mono muted">
        <span className={isPast && !submission ? 'text-[color:var(--rose)]' : ''}>
          Due {fmtDate(project.due_date)}
        </span>
        {submission && (
          <>
            <span>·</span>
            <span>Submitted {fmtRelative(submission.submitted_at)}</span>
          </>
        )}
      </div>

      <Link to={`/projects/${project.id}`}
        className="h-9 rounded-xl hairline flex items-center justify-center text-[13px] font-semibold hover:bg-[var(--hair-2)] transition-colors">
        {submission ? 'View submission' : 'View project'}
      </Link>
    </div>
  )
}

export function ProjectCardSkeleton() {
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card p-5 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
      </div>
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-9 w-full rounded-xl" />
    </div>
  )
}
