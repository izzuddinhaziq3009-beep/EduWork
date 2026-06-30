import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useCreateChallenge } from '@/hooks/useCompany'
import { ChallengeForm } from '@/components/features/challenges/ChallengeForm'
import { PageHeader } from '@/components/common/PageHeader'
import type { ChallengeFormValues } from '@/components/features/challenges/challengeFormSchema'

export function PostChallenge() {
  const { user } = useAuthStore()
  const navigate  = useNavigate()
  const create    = useCreateChallenge()

  const handleSubmit = (values: ChallengeFormValues) => {
    if (!user) return
    create.mutate(
      { companyId: user.id, payload: { ...values, deadline: new Date(values.deadline).toISOString() } },
      { onSuccess: () => navigate('/company/challenges') },
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-[700px]">
      <PageHeader
        label="New challenge"
        title="Post a Challenge"
        description="Create a real-world challenge for students. It will be reviewed by our admin team before going live."
      />

      {/* Approval note */}
      <div className="hairline rounded-xl px-4 py-3 mb-6 flex items-start gap-2.5"
        style={{ background: 'var(--primary-soft)', borderColor: 'var(--primary)' }}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }}>
          <circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>
        </svg>
        <p className="text-[13px]" style={{ color: 'var(--primary)' }}>
          Challenges are reviewed before going live. You'll be notified once it's approved.
        </p>
      </div>

      <div className="bg-surface hairline rounded-2xl shadow-card p-6">
        <ChallengeForm
          onSubmit={handleSubmit}
          loading={create.isPending}
          submitLabel="Submit for approval"
        />
      </div>
    </div>
  )
}
