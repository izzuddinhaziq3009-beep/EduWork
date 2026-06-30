import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useCompanyChallenge, useUpdateChallenge, useResubmitChallenge } from '@/hooks/useCompany'
import { ChallengeForm } from '@/components/features/challenges/ChallengeForm'
import { PageHeader } from '@/components/common/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import type { ChallengeFormValues } from '@/components/features/challenges/challengeFormSchema'

export function EditChallenge() {
  const { id = '' }  = useParams()
  const { user, profile } = useAuthStore()
  const navigate     = useNavigate()

  const { data: challenge, isLoading } = useCompanyChallenge(id)
  const update    = useUpdateChallenge()
  const resubmit  = useResubmitChallenge()

  const isRejected = !!challenge?.rejection_reason
  const isApproved = !!challenge?.is_approved

  const handleSubmit = (values: ChallengeFormValues) => {
    if (!user || !challenge) return
    const deadline = new Date(values.deadline).toISOString()

    if (isRejected) {
      // Resubmit flow — clears rejection fields and notifies admins
      resubmit.mutate({
        challengeId:    id,
        companyId:      user.id,
        companyName:    profile?.full_name ?? user.email ?? 'Company',
        challengeTitle: values.title,
        payload:        { ...values, deadline },
      }, { onSuccess: () => navigate('/company/challenges') })
    } else if (isApproved) {
      // Editing an approved challenge requires re-approval
      update.mutate({
        challengeId: id,
        companyId:   user.id,
        payload:     { ...values, deadline },
      }, { onSuccess: () => navigate('/company/challenges') })
    } else {
      // Normal pending edit
      update.mutate({
        challengeId: id,
        companyId:   user.id,
        payload:     { ...values, deadline },
      }, { onSuccess: () => navigate('/company/challenges') })
    }
  }

  const defaultValues = challenge ? {
    title:            challenge.title,
    description:      challenge.description,
    requirements:     challenge.requirements,
    difficulty_level: challenge.difficulty_level,
    deadline:         new Date(challenge.deadline).toISOString().slice(0, 16),
  } : undefined

  const submitLabel = isRejected ? 'Resubmit for Approval' : isApproved ? 'Save & Request Re-Approval' : 'Save changes'
  const isPending   = resubmit.isPending || update.isPending

  return (
    <div className="p-6 lg:p-8 max-w-[700px]">
      <Link to="/company/challenges"
        className="text-[13px] font-medium flex items-center gap-1.5 mb-6"
        style={{ color: 'var(--primary)' }}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to challenges
      </Link>

      <PageHeader label={isRejected ? 'Address feedback' : 'Edit'} title={isRejected ? 'Edit & Resubmit' : 'Edit Challenge'} />

      {/* Rejection banner */}
      {!isLoading && isRejected && challenge.rejection_reason && (
        <div className="hairline rounded-xl px-4 py-4 mb-6 space-y-1"
          style={{ background: 'var(--rose-soft)', borderColor: 'var(--rose)' }}>
          <div className="text-[13.5px] font-semibold" style={{ color: 'var(--rose)' }}>
            This challenge was not approved
          </div>
          <p className="text-[13px] ink-2"><strong>Reason: </strong>{challenge.rejection_reason}</p>
          <p className="text-[12.5px] muted mt-1">
            Please address the feedback above, update the challenge, and resubmit for admin approval.
          </p>
        </div>
      )}

      {/* Approved-challenge warning */}
      {!isLoading && isApproved && !isRejected && (
        <div className="hairline rounded-xl px-4 py-3 mb-6 flex items-start gap-2.5"
          style={{ background: 'var(--warn-soft)', borderColor: 'var(--warn)' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" style={{ color: 'var(--warn)' }}>
            <circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>
          </svg>
          <p className="text-[13px]" style={{ color: 'var(--warn)' }}>
            This challenge is currently <strong>active</strong>. Saving changes will pause it and require admin re-approval before it goes live again.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="bg-surface hairline rounded-2xl shadow-card p-6 space-y-5">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
        </div>
      ) : (
        <div className="bg-surface hairline rounded-2xl shadow-card p-6">
          <ChallengeForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            loading={isPending}
            submitLabel={submitLabel}
          />
        </div>
      )}
    </div>
  )
}
