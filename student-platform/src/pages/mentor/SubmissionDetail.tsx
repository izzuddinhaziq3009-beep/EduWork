import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useSubmissionDetail, useSubmitFeedback } from '@/hooks/useMentor'
import { SubmissionStatus } from '@/components/features/projects/SubmissionStatus'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { fmtDate, fmtDateTime, fmtInitials } from '@/utils/formatters'
import { useQuery } from '@tanstack/react-query'
import { getStudentSummary } from '@/services/companyService'

const COLORS = ['#0F4C5C', '#2C9D6E', '#C97A2D', '#B8456A', '#3B6AC9']
function avatarColor(name: string) { return COLORS[name.charCodeAt(0) % COLORS.length] }

export function SubmissionDetail() {
  const { id = '' } = useParams()
  const { user } = useAuthStore()
  const [feedbackText, setFeedbackText] = useState('')
  const [error, setError] = useState('')

  const { data: ctx, isLoading } = useSubmissionDetail(id)
  const submitFeedback = useSubmitFeedback()

  const { data: summary } = useQuery({
    queryKey: ['student-summary', ctx?.student.id],
    queryFn:  () => getStudentSummary(ctx!.student.id),
    enabled:  !!ctx?.student.id,
  })

  const handleAction = (status: 'approved' | 'revision_requested') => {
    if (!user || !ctx) return
    if (!feedbackText.trim()) { setError('Please write feedback before submitting.'); return }
    setError('')
    submitFeedback.mutate({
      submissionId: ctx.submission.id,
      mentorId:     user.id,
      studentId:    ctx.student.id,
      feedbackText: feedbackText.trim(),
      status,
    })
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-[1000px]">
        <Skeleton className="h-4 w-32 mb-6" />
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-4"><Skeleton className="h-64 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /></div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!ctx) return <div className="p-8 muted">Submission not found.</div>

  const { submission, project, student, feedback } = ctx

  return (
    <div className="p-6 lg:p-8 max-w-[1000px]">
      <Link to="/mentor/submissions"
        className="text-[13px] font-medium flex items-center gap-1.5 mb-6"
        style={{ color: 'var(--primary)' }}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to submissions
      </Link>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Left: submission info */}
        <div className="space-y-5">
          {/* Student + status */}
          <div className="bg-surface hairline rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl grid place-items-center font-mono font-bold text-white text-[16px] shrink-0"
              style={{ background: avatarColor(student.full_name) }}>
              {fmtInitials(student.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-semibold">{student.full_name}</div>
              <div className="text-[12.5px] muted">{student.email}</div>
            </div>
            {summary && (
              <div className="flex gap-4 text-center shrink-0">
                {[
                  { label: 'Modules',    value: summary.completedModules    },
                  { label: 'Projects',   value: summary.approvedProjects    },
                  { label: 'Challenges', value: summary.completedChallenges },
                ].map(s => (
                  <div key={s.label}>
                    <div className="font-display text-[20px] font-semibold leading-none">{s.value}</div>
                    <div className="text-[10px] font-mono muted mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
            <SubmissionStatus status={submission.status} />
          </div>

          {/* Project */}
          <div className="bg-surface hairline rounded-2xl p-5 space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[17px] font-semibold">{project.title}</h2>
              <span className="text-[12px] font-mono muted">Due {fmtDate(project.due_date)}</span>
            </div>
            <div>
              <div className="text-[12px] font-mono muted uppercase tracking-wide mb-2">Requirements</div>
              <div className="text-[14px] ink-2 leading-relaxed whitespace-pre-wrap">{project.requirements}</div>
            </div>
          </div>

          {/* Submission content */}
          <div className="bg-surface hairline rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold">Submitted work</h3>
              <span className="text-[12px] font-mono muted">{fmtDateTime(submission.submitted_at)}</span>
            </div>
            <div className="text-[14px] ink-2 leading-relaxed whitespace-pre-wrap bg-[var(--hair-2)] rounded-xl p-4">
              {submission.submission_content}
            </div>
            {submission.file_url && (
              <a href={submission.file_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[13px] font-medium hover:underline"
                style={{ color: 'var(--primary)' }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v6h6"/></svg>
                View attachment
              </a>
            )}
          </div>

          {/* Previous feedback */}
          {feedback && (
            <div className="hairline rounded-2xl p-5 space-y-3"
              style={{ background: feedback.status === 'approved' ? 'var(--accent-soft)' : 'var(--rose-soft)' }}>
              <div className="flex items-center justify-between">
                <div className="text-[14px] font-semibold">Previous feedback</div>
                <span className="tag" style={{
                  background: feedback.status === 'approved' ? 'var(--accent-soft)' : 'var(--rose-soft)',
                  color:      feedback.status === 'approved' ? 'var(--accent)'      : 'var(--rose)',
                }}>
                  {feedback.status === 'approved' ? 'Approved' : 'Revision requested'}
                </span>
              </div>
              <p className="text-[14px] ink-2 leading-relaxed">{feedback.feedback_text}</p>
            </div>
          )}
        </div>

        {/* Right: feedback form */}
        <div className="bg-surface hairline rounded-2xl shadow-card p-5 space-y-4 h-fit">
          <h3 className="text-[16px] font-semibold">Your feedback</h3>
          <Textarea
            value={feedbackText}
            onChange={e => { setFeedbackText(e.target.value); setError('') }}
            rows={8}
            placeholder="Give the student specific, actionable feedback on their work…"
          />
          {error && (
            <div className="text-[12.5px] font-medium" style={{ color: 'var(--rose)' }}>{error}</div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAction('revision_requested')}
              disabled={submitFeedback.isPending}
              className="h-11 rounded-xl hairline text-[13.5px] font-semibold hover:bg-[var(--hair-2)] disabled:opacity-60 transition-colors"
              style={{ color: 'var(--rose)' }}>
              {submitFeedback.isPending ? '…' : 'Request revision'}
            </button>
            <button
              onClick={() => handleAction('approved')}
              disabled={submitFeedback.isPending}
              className="h-11 rounded-xl text-[13.5px] font-semibold text-white disabled:opacity-60 transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)' }}>
              {submitFeedback.isPending ? '…' : '✓ Approve'}
            </button>
          </div>
          <p className="text-[11.5px] muted">The student will be notified immediately.</p>
        </div>
      </div>
    </div>
  )
}
