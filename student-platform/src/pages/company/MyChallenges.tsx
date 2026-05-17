import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useCompanyChallenges, useDeleteChallenge } from '@/hooks/useCompany'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { fmtDate } from '@/utils/formatters'
import type { ChallengeWithStats } from '@/services/companyService'

function challengeStatus(c: ChallengeWithStats) {
  if (!c.is_approved) return { label: 'Pending approval', bg: 'var(--warn-soft)',    color: 'var(--warn)'    }
  if (c.is_active)    return { label: 'Active',           bg: 'var(--accent-soft)',  color: 'var(--accent)'  }
  return                     { label: 'Inactive',         bg: 'var(--hair-2)',       color: 'var(--muted)'   }
}

export function MyChallenges() {
  const { user } = useAuthStore()
  const { data: challenges = [], isLoading } = useCompanyChallenges(user?.id ?? '')
  const deleteChallenge = useDeleteChallenge()

  return (
    <div className="p-6 lg:p-8 max-w-[1000px]">
      <PageHeader
        label="Your challenges"
        title="My Challenges"
        description="Track approval status and submissions for all your posted challenges."
        action={
          <Link to="/company/post-challenge">
            <Button style={{ background: 'var(--primary)', color: '#fff' }}>+ Post new</Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : challenges.length === 0 ? (
        <EmptyState
          icon={<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4"/><path d="M5 5h12l-2 4 2 4H5"/></svg>}
          title="No challenges yet"
          description="Post your first challenge to start receiving student submissions."
          action={<Link to="/company/post-challenge"><Button style={{ background: 'var(--primary)', color: '#fff' }}>Post a challenge</Button></Link>}
        />
      ) : (
        <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
          <div className="divide-y divide-[var(--hair)]">
            {challenges.map(c => {
              const st = challengeStatus(c)
              const canDelete = !c.is_approved
              return (
                <div key={c.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-1">
                      <span className="text-[15px] font-semibold">{c.title}</span>
                      <span className="tag" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      <DifficultyBadge level={c.difficulty_level} />
                    </div>
                    <div className="flex items-center gap-3 text-[12px] font-mono muted flex-wrap">
                      <span>Deadline {fmtDate(c.deadline)}</span>
                      <span>·</span>
                      <span>{c.submissionCount} submission{c.submissionCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {c.submissionCount > 0 && (
                      <Link to={`/company/submissions?challenge=${c.id}`}
                        className="h-8 px-3 rounded-lg text-[12.5px] font-semibold hairline hover:bg-[var(--hair-2)] transition-colors"
                        style={{ color: 'var(--primary)' }}>
                        View subs
                      </Link>
                    )}
                    <Link to={`/company/challenges/${c.id}/edit`}
                      className="h-8 px-3 rounded-lg text-[12.5px] font-semibold hairline hover:bg-[var(--hair-2)] transition-colors ink-2">
                      Edit
                    </Link>
                    {canDelete && (
                      <button
                        onClick={() => user && deleteChallenge.mutate({ challengeId: c.id, companyId: user.id })}
                        disabled={deleteChallenge.isPending}
                        className="h-8 px-3 rounded-lg text-[12.5px] font-semibold hairline hover:bg-[var(--rose-soft)] transition-colors disabled:opacity-60"
                        style={{ color: 'var(--rose)' }}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
