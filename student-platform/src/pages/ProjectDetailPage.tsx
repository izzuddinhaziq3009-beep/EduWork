import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useProject, useStudentSubmissions, useSubmitProject, useMentorFeedback } from '@/hooks/useProjects'
import { ProjectSubmissionForm } from '@/components/features/projects/ProjectSubmissionForm'
import { SubmissionStatus } from '@/components/features/projects/SubmissionStatus'
import { FeedbackView } from '@/components/features/projects/FeedbackView'
import { Skeleton } from '@/components/ui/skeleton'
import { fmtDate, fmtRelative } from '@/utils/formatters'

export function ProjectDetailPage() {
  const { id = '' } = useParams()
  const { user } = useAuthStore()

  const { data: project,     isLoading: loadingProject }  = useProject(id)
  const { data: submissions, isLoading: loadingSubs }     = useStudentSubmissions(user?.id ?? '')
  const submit = useSubmitProject()

  const submission = submissions?.find(s => s.project_id === id)
  const { data: feedback } = useMentorFeedback(submission?.id ?? '')

  const canSubmit = !submission || submission.status === 'revision_requested'

  if (loadingProject || loadingSubs) {
    return (
      <div className="p-6 lg:p-8 max-w-[800px]">
        <Skeleton className="h-4 w-24 mb-6" />
        <Skeleton className="h-9 w-2/3 mb-3" />
        <Skeleton className="h-4 w-full mb-8" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    )
  }

  if (!project) return <div className="p-8 muted">Project not found.</div>

  return (
    <div className="p-6 lg:p-8 max-w-[800px]">
      <Link to="/projects" className="text-[13px] font-medium flex items-center gap-1.5 mb-6"
        style={{ color: 'var(--primary)' }}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to projects
      </Link>

      {/* Project info */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          {submission && <SubmissionStatus status={submission.status} />}
          <span className="tag" style={{ background: 'var(--hair-2)', color: 'var(--ink-2)' }}>
            Due {fmtDate(project.due_date)}
          </span>
        </div>
        <h1 className="font-display text-[30px] font-semibold tracking-tight leading-tight mb-2">{project.title}</h1>
        <p className="text-[15px] muted leading-relaxed">{project.description}</p>
      </div>

      {/* Requirements */}
      <div className="bg-surface hairline rounded-2xl p-6 mb-6">
        <h2 className="text-[17px] font-semibold mb-4">Requirements</h2>
        <div className="text-[14px] ink-2 leading-relaxed whitespace-pre-wrap">{project.requirements}</div>
      </div>

      {/* Feedback (if any) */}
      {feedback && <div className="mb-6"><FeedbackView feedback={feedback} /></div>}

      {/* Submission section */}
      <div className="bg-surface hairline rounded-2xl p-6">
        {submission && !canSubmit ? (
          <div className="space-y-4">
            <h2 className="text-[17px] font-semibold">Your submission</h2>
            <div className="flex items-center gap-2 text-[12.5px] muted font-mono">
              <span>Submitted {fmtRelative(submission.submitted_at)}</span>
            </div>
            <div className="hairline rounded-xl p-4 text-[14px] ink-2 leading-relaxed whitespace-pre-wrap bg-[var(--hair-2)]">
              {submission.submission_content}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-[17px] font-semibold mb-1">
              {submission?.status === 'revision_requested' ? 'Resubmit your work' : 'Submit your work'}
            </h2>
            {submission?.status === 'revision_requested' && (
              <p className="text-[13px] muted mb-4">Your mentor has requested revisions — see the feedback above and resubmit.</p>
            )}
            <div className="mt-4">
              <ProjectSubmissionForm
                loading={submit.isPending}
                onSubmit={(content, file) =>
                  user && submit.mutate({ projectId: id, studentId: user.id, content, file })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
