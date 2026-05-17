import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useCompanyChallenge, useUpdateChallenge } from '@/hooks/useCompany'
import { ChallengeForm } from '@/components/features/challenges/ChallengeForm'
import { PageHeader } from '@/components/common/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import type { ChallengeFormValues } from '@/components/features/challenges/ChallengeForm'

export function EditChallenge() {
  const { id = '' }  = useParams()
  const { user }     = useAuthStore()
  const navigate     = useNavigate()

  const { data: challenge, isLoading } = useCompanyChallenge(id)
  const update = useUpdateChallenge()

  const handleSubmit = (values: ChallengeFormValues) => {
    if (!user) return
    update.mutate(
      { challengeId: id, companyId: user.id, payload: { ...values, deadline: new Date(values.deadline).toISOString() } },
      { onSuccess: () => navigate('/company/challenges') },
    )
  }

  const defaultValues = challenge ? {
    title:            challenge.title,
    description:      challenge.description,
    requirements:     challenge.requirements,
    difficulty_level: challenge.difficulty_level,
    deadline:         new Date(challenge.deadline).toISOString().slice(0, 16),
  } : undefined

  return (
    <div className="p-6 lg:p-8 max-w-[700px]">
      <Link to="/company/challenges"
        className="text-[13px] font-medium flex items-center gap-1.5 mb-6"
        style={{ color: 'var(--primary)' }}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to challenges
      </Link>

      <PageHeader label="Edit" title="Edit Challenge" />

      {isLoading ? (
        <div className="bg-surface hairline rounded-2xl shadow-card p-6 space-y-5">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
        </div>
      ) : (
        <div className="bg-surface hairline rounded-2xl shadow-card p-6">
          <ChallengeForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            loading={update.isPending}
            submitLabel="Save changes"
          />
        </div>
      )}
    </div>
  )
}
