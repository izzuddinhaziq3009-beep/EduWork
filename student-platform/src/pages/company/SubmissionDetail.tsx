import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import {
  useCompanySubmissionDetail, useLeaveFeedback, useSubmissionFeedback,
} from '@/hooks/useCompany'
import { StarRating } from '@/components/features/challenges/StarRating'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { fmtDateTime, fmtRelative, fmtInitials } from '@/utils/formatters'
import { getStudentSummary } from '@/services/companyService'
import { useQuery } from '@tanstack/react-query'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'

const COLORS = ['#1E5BFF', '#0F4C5C', '#2C9D6E', '#C97A2D', '#B8456A']
function avatarColor(name: string) { return COLORS[name.charCodeAt(0) % COLORS.length] }

export function CompanySubmissionDetail() {
  const { id = '' }  = useParams()
  const { user }     = useAuthStore()
  const [rating, setRating]             = useState(0)
  const [feedbackText, setFeedbackText] = useState('')
  const [error, setError]               = useState('')

  const { data: ctx,      isLoading }        = useCompanySubmissionDetail(id)
  const { data: feedback, isLoading: loadFb } = useSubmissionFeedback(id)
  const { data: summary  }                   = useQuery({
    queryKey: ['student-summary', ctx?.student.id],
    queryFn:  () => getStudentSummary(ctx!.student.id),
    enabled:  !!ctx?.student.id,
  })

  const leaveFeedback = useLeaveFeedback()

  const handleSubmitFeedback = () => {
    if (!user || !ctx) return
    if (rating === 0)     { setError('Please select a rating.');         return }
    if (!feedbackText.trim()) { setError('Please write feedback text.'); return }
    setError('')
    leaveFeedback.mutate({
      submissionId: id,
      reviewerId:   user.id,
      studentId:    ctx.student.id,
      feedbackText: feedbackText.trim(),
      rating,
      companyId:    user.id,
    })
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-[1000px]">
        <Skeleton className="h-4 w-32 mb-6" />
        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-4"><Skeleton className="h-48 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /></div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!ctx) return <div className="p-8 muted">Submission not found.</div>

  const { submission, challenge, student } = ctx

  return (
    <div className="p-6 lg:p-8 max-w-[1000px]">
      <Link to="/company/submissions"
        className="text-[13px] font-medium flex items-center gap-1.5 mb-6"
        style={{ color: 'var(--primary)' }}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to submissions
      </Link>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Left: details */}
        <div className="space-y-5">
          {/* Student card */}
          <div className="bg-surface hairline rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl grid place-items-center font-mono font-bold text-white text-[16px] shrink-0"
              style={{ background: avatarColor(student.full_name) }}>
              {fmtInitials(student.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-semibold">{student.full_name}</div>
              <div className="text-[12.5px] muted">{student.email}</div>
            </div>
            {/* Student summary */}
            {summary && (
              <div className="flex gap-4 text-center shrink-0">
                {[
                  { label: 'Modules',   value: summary.completedModules   },
                  { label: 'Projects',  value: summary.approvedProjects   },
                  { label: 'Challenges',value: summary.completedChallenges },
                ].map(s => (
                  <div key={s.label}>
                    <div className="font-display text-[20px] font-semibold leading-none">{s.value}</div>
                    <div className="text-[10px] font-mono muted mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Challenge info */}
          <div className="bg-surface hairline rounded-2xl p-5 space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-[17px] font-semibold">{challenge.title}</h2>
              <DifficultyBadge level={challenge.difficulty_level} />
            </div>
            <p className="text-[14px] ink-2 leading-relaxed">{challenge.description}</p>
            <div>
              <div className="text-[12px] font-mono muted uppercase tracking-wide mb-2">Requirements</div>
              <div className="text-[13.5px] ink-2 leading-relaxed whitespace-pre-wrap">{challenge.requirements}</div>
            </div>
          </div>

          {/* Submission info */}
          <div className="bg-surface hairline rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold">Submission details</h3>
              <span className="text-[12px] font-mono muted">{fmtDateTime(submission.submitted_at)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Commits',   value: String(submission.github_commit_count) },
                { label: 'Verified',  value: submission.github_verified ? '✓ Yes' : 'No' },
                { label: 'README.md', value: submission.readme_exists ? '✓ Found' : 'Missing' },
                { label: 'Privacy file', value: submission.privacy_file_exists ? '✓ Found' : 'Missing' },
              ].map(i => (
                <div key={i.label} className="hairline rounded-xl p-3" style={{ background: '#FBFAF5' }}>
                  <div className="text-[11px] font-mono muted uppercase tracking-wide">{i.label}</div>
                  <div className="text-[14px] font-semibold mt-0.5"
                    style={{ color: i.value.startsWith('✓') ? 'var(--accent)' : 'var(--ink)' }}>
                    {i.value}
                  </div>
                </div>
              ))}
            </div>
            <a href={submission.github_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[13px] font-medium hover:underline"
              style={{ color: 'var(--primary)' }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.14-1.1-1.44-1.1-1.44-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.9.83.1-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.9-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>
              {submission.github_username}/{submission.github_repo_name}
            </a>
          </div>

          {/* Previous feedback */}
          {!loadFb && feedback && (
            <div className="hairline rounded-2xl p-5 space-y-3" style={{ background: 'var(--accent-soft)' }}>
              <div className="flex items-center justify-between">
                <div className="text-[14px] font-semibold" style={{ color: 'var(--accent)' }}>Your feedback</div>
                <StarRating value={feedback.rating} readonly size={18} />
              </div>
              <p className="text-[13.5px] ink-2 leading-relaxed">{feedback.feedback_text}</p>
              <div className="text-[11.5px] muted font-mono">{fmtRelative(feedback.created_at)}</div>
            </div>
          )}
        </div>

        {/* Right: feedback form */}
        {!feedback && (
          <div className="bg-surface hairline rounded-2xl shadow-card p-5 space-y-4 h-fit">
            <h3 className="text-[16px] font-semibold">Leave feedback</h3>
            <div>
              <div className="text-[12.5px] font-medium ink-2 mb-2">Rating</div>
              <StarRating value={rating} onChange={setRating} size={28} />
            </div>
            <Textarea
              value={feedbackText}
              onChange={e => { setFeedbackText(e.target.value); setError('') }}
              rows={6}
              placeholder="Share detailed feedback on what the student did well and what they can improve…"
            />
            {error && <div className="text-[12.5px] font-medium" style={{ color: 'var(--rose)' }}>{error}</div>}
            <button
              onClick={handleSubmitFeedback}
              disabled={leaveFeedback.isPending}
              className="w-full h-11 rounded-xl text-[13.5px] font-semibold text-white disabled:opacity-60 transition-opacity hover:opacity-90"
              style={{ background: 'var(--primary)' }}>
              {leaveFeedback.isPending ? 'Submitting…' : 'Submit feedback'}
            </button>
            <p className="text-[11.5px] muted">The student will receive a notification.</p>
          </div>
        )}
      </div>
    </div>
  )
}
