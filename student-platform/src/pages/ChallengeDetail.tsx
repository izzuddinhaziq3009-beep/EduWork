import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useChallenge, useChallengeSubmission, useSubmitChallenge } from '@/hooks/useChallenges'
import { ChallengeSubmissionForm } from '@/components/features/challenges/ChallengeSubmissionForm'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'
import { StarRating } from '@/components/features/challenges/StarRating'
import { Skeleton } from '@/components/ui/skeleton'
import { fmtDate, fmtRelative } from '@/utils/formatters'
import type { GitHubValidationResult } from '@/services/challengeService'
import { useSubmissionFeedback } from '@/hooks/useCompany'

const COLORS = ['#1E5BFF', '#0F4C5C', '#2C9D6E', '#C97A2D', '#B8456A']
function companyColor(name: string) { return COLORS[name.charCodeAt(0) % COLORS.length] }

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  submitted:      { label: 'Submitted',    bg: 'var(--primary-soft)', color: 'var(--primary)' },
  reviewing:      { label: 'Under review', bg: 'var(--warn-soft)',    color: 'var(--warn)'    },
  feedback_given: { label: 'Reviewed',     bg: 'var(--accent-soft)',  color: 'var(--accent)'  },
  completed:      { label: 'Completed',    bg: 'var(--accent-soft)',  color: 'var(--accent)'  },
}

export function ChallengeDetail() {
  const { id = '' }  = useParams()
  const { user }     = useAuthStore()
  const [showForm, setShowForm] = useState(false)

  const { data: challenge, isLoading: loadingChallenge } = useChallenge(id)
  const { data: submission }                              = useChallengeSubmission(id, user?.id ?? '')
  const { data: feedback }                               = useSubmissionFeedback(submission?.id ?? '')
  const submit = useSubmitChallenge()

  const handleSubmit = (validation: GitHubValidationResult) => {
    if (!user) return
    submit.mutate(
      { challengeId: id, studentId: user.id, validation },
      { onSuccess: () => setShowForm(false) },
    )
  }

  if (loadingChallenge) {
    return (
      <div className="p-6 lg:p-8 max-w-[900px]">
        <Skeleton className="h-4 w-32 mb-6" />
        <Skeleton className="h-10 w-2/3 mb-4" />
        <Skeleton className="h-48 w-full rounded-2xl mb-5" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    )
  }

  if (!challenge) return <div className="p-8 muted">Challenge not found.</div>

  const isPast = new Date(challenge.deadline) < new Date()
  const st     = submission ? STATUS_STYLE[submission.status] : null

  return (
    <div className="p-6 lg:p-8 max-w-[900px]">
      <Link to="/challenges"
        className="text-[13px] font-medium flex items-center gap-1.5 mb-6"
        style={{ color: 'var(--primary)' }}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to challenges
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {/* Company */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg grid place-items-center font-mono font-bold text-white text-[13px] shrink-0"
              style={{ background: companyColor(challenge.company.full_name) }}>
              {challenge.company.full_name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[13px] font-medium ink-2">{challenge.company.full_name}</span>
          </div>
          <DifficultyBadge level={challenge.difficulty_level} />
          {st && <span className="tag" style={{ background: st.bg, color: st.color }}>{st.label}</span>}
          <span className={`text-[12px] font-mono ${isPast ? 'text-[color:var(--rose)]' : 'muted'}`}>
            {isPast ? 'Ended' : 'Deadline'} {fmtDate(challenge.deadline)}
          </span>
        </div>
        <h1 className="font-display text-[30px] font-semibold tracking-tight leading-tight">{challenge.title}</h1>
        <p className="text-[15px] muted mt-2 leading-relaxed">{challenge.description}</p>
      </div>

      {/* Requirements */}
      <div className="bg-surface hairline rounded-2xl p-6 mb-5">
        <h2 className="text-[16px] font-semibold mb-4">Requirements</h2>
        <div className="text-[14px] ink-2 leading-relaxed whitespace-pre-wrap">{challenge.requirements}</div>
      </div>

      {/* Submission area */}
      <div className="bg-surface hairline rounded-2xl p-6 space-y-4">
        {submission ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold">Your submission</h2>
              <span className="text-[12px] font-mono muted">{fmtRelative(submission.submitted_at)}</span>
            </div>
            <a href={submission.github_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-[14px] font-medium hover:underline"
              style={{ color: 'var(--primary)' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.14-1.1-1.44-1.1-1.44-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.9.83.1-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.9-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>
              {submission.github_username}/{submission.github_repo_name}
              <span className="text-[12px] font-mono muted">({submission.github_commit_count} commits)</span>
            </a>

            {/* Company feedback */}
            {feedback && (
              <div className="hairline rounded-xl p-4 space-y-2.5 mt-2"
                style={{ background: 'var(--accent-soft)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-[13.5px] font-semibold" style={{ color: 'var(--accent)' }}>
                    Company feedback
                  </span>
                  <StarRating value={feedback.rating} readonly size={16} />
                </div>
                <p className="text-[13.5px] ink-2 leading-relaxed">{feedback.feedback_text}</p>
                <div className="text-[11.5px] muted font-mono">{fmtRelative(feedback.created_at)}</div>
              </div>
            )}
          </>
        ) : showForm ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold">Submit your solution</h2>
              <button onClick={() => setShowForm(false)} className="text-[13px] muted hover:ink-2">Cancel</button>
            </div>
            <ChallengeSubmissionForm onSubmit={handleSubmit} loading={submit.isPending} />
          </>
        ) : (
          <div className="text-center py-4">
            <h2 className="text-[16px] font-semibold mb-1.5">Ready to submit?</h2>
            <p className="text-[13.5px] muted mb-4 max-w-md mx-auto">
              Submit your GitHub repository URL. It must be public, contain a README.md, a .github/SUBMISSION_PRIVACY.md, and at least 3 commits.
            </p>
            <button
              onClick={() => setShowForm(true)}
              disabled={isPast}
              className="h-11 px-6 rounded-xl text-[13.5px] font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ background: 'var(--primary)' }}>
              {isPast ? 'Challenge has ended' : 'Submit solution'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
