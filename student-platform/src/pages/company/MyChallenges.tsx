import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import {
  useCompanyChallenges, useCompanyPendingChallenges,
  useCompanyApprovedChallenges, useCompanyRejectedChallenges,
  useDeleteChallenge,
} from '@/hooks/useCompany'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fmtDate, fmtRelative } from '@/utils/formatters'
import type { ChallengeWithStats } from '@/services/companyService'

const FlagIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 21V4"/><path d="M5 5h12l-2 4 2 4H5"/>
  </svg>
)

function ChallengeRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-[var(--hair)]">
      <div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /></div>
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  )
}

// ── Pending tab ────────────────────────────────────────────────────────────

function PendingTab({ companyId }: { companyId: string }) {
  const { data: challenges = [], isLoading } = useCompanyPendingChallenges(companyId)

  if (isLoading) return <SkeletonList />
  if (challenges.length === 0) return (
    <EmptyState icon={<FlagIcon />} title="No pending challenges"
      description="All your challenges have been reviewed."
      action={<Link to="/company/post-challenge"><Button style={{ background: 'var(--primary)', color: '#fff' }}>Post a challenge</Button></Link>}
    />
  )

  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      <div className="divide-y divide-[var(--hair)]">
        {challenges.map(c => (
          <div key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-2 px-5 py-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap mb-1">
                <span className="text-[14.5px] font-semibold">{c.title}</span>
                <span className="tag" style={{ background: 'var(--warn-soft)', color: 'var(--warn)' }}>Pending approval</span>
                <DifficultyBadge level={c.difficulty_level} />
              </div>
              <div className="text-[12px] font-mono muted">
                Deadline {fmtDate(c.deadline)} · Posted {fmtRelative(c.created_at)}
              </div>
            </div>
            <div className="shrink-0 text-[12px] muted italic">Awaiting admin review</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Approved tab ────────────────────────────────────────────────────────────

function ApprovedTab({ companyId, userId }: { companyId: string; userId: string }) {
  const { data: challenges = [], isLoading } = useCompanyApprovedChallenges(companyId)
  const deleteChallenge = useDeleteChallenge()

  if (isLoading) return <SkeletonList />
  if (challenges.length === 0) return (
    <EmptyState icon={<FlagIcon />} title="No approved challenges yet"
      description="Challenges approved by the admin will appear here." />
  )

  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      <div className="divide-y divide-[var(--hair)]">
        {challenges.map(c => (
          <div key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap mb-1">
                <span className="text-[14.5px] font-semibold">{c.title}</span>
                <span className="tag" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>Active</span>
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
                className="h-8 px-3 rounded-lg text-[12.5px] font-semibold hairline hover:bg-[var(--hair-2)] transition-colors ink-2"
                title="Editing an active challenge will require re-approval">
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Rejected tab ────────────────────────────────────────────────────────────

function RejectedTab({ companyId }: { companyId: string }) {
  const { data: challenges = [], isLoading } = useCompanyRejectedChallenges(companyId)

  if (isLoading) return <SkeletonList />
  if (challenges.length === 0) return (
    <EmptyState icon={<FlagIcon />} title="No rejected challenges"
      description="Challenges rejected by the admin will appear here." />
  )

  return (
    <div className="space-y-4">
      {challenges.map(c => (
        <div key={c.id} className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 px-5 py-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap mb-1">
                <span className="text-[14.5px] font-semibold">{c.title}</span>
                <span className="tag" style={{ background: 'var(--rose-soft)', color: 'var(--rose)' }}>Rejected</span>
                <DifficultyBadge level={c.difficulty_level} />
              </div>
              <div className="text-[12px] font-mono muted mb-3">
                Deadline {fmtDate(c.deadline)}
                {c.rejected_at && <span> · Rejected {fmtRelative(c.rejected_at)}</span>}
              </div>
              {c.rejection_reason && (
                <div className="hairline rounded-xl px-4 py-3 text-[13px] leading-relaxed"
                  style={{ background: 'var(--rose-soft)', borderColor: 'var(--rose)', color: 'var(--ink-2)' }}>
                  <span className="font-semibold" style={{ color: 'var(--rose)' }}>Rejection reason: </span>
                  {c.rejection_reason}
                </div>
              )}
            </div>
            <Link to={`/company/challenges/${c.id}/edit`}
              className="shrink-0 h-10 px-4 rounded-xl text-[13.5px] font-semibold text-white mt-0.5 text-center transition-opacity hover:opacity-90"
              style={{ background: 'var(--primary)' }}>
              Edit &amp; Resubmit
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── All tab ─────────────────────────────────────────────────────────────────

function AllTab({ companyId, userId }: { companyId: string; userId: string }) {
  const { data: challenges = [], isLoading } = useCompanyChallenges(companyId)
  const deleteChallenge = useDeleteChallenge()

  if (isLoading) return <SkeletonList />
  if (challenges.length === 0) return (
    <EmptyState icon={<FlagIcon />} title="No challenges yet"
      description="Post your first challenge to start receiving student submissions."
      action={<Link to="/company/post-challenge"><Button style={{ background: 'var(--primary)', color: '#fff' }}>Post a challenge</Button></Link>}
    />
  )

  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      <div className="divide-y divide-[var(--hair)]">
        {challenges.map(c => {
          const isRejected = !!c.rejection_reason
          const isPending  = !c.is_approved && !isRejected
          const isApproved = c.is_approved

          const badge = isRejected ? { label: 'Rejected',        bg: 'var(--rose-soft)',    color: 'var(--rose)'    }
                      : isPending  ? { label: 'Pending approval', bg: 'var(--warn-soft)',    color: 'var(--warn)'    }
                      :              { label: 'Active',           bg: 'var(--accent-soft)',  color: 'var(--accent)'  }

          return (
            <div key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap mb-1">
                  <span className="text-[14.5px] font-semibold">{c.title}</span>
                  <span className="tag" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                  <DifficultyBadge level={c.difficulty_level} />
                </div>
                <div className="flex items-center gap-3 text-[12px] font-mono muted flex-wrap">
                  <span>Deadline {fmtDate(c.deadline)}</span>
                  <span>·</span>
                  <span>{c.submissionCount} submission{c.submissionCount !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {c.submissionCount > 0 && (
                  <Link to={`/company/submissions?challenge=${c.id}`}
                    className="h-8 px-3 rounded-lg text-[12.5px] font-semibold hairline hover:bg-[var(--hair-2)] transition-colors"
                    style={{ color: 'var(--primary)' }}>
                    View subs
                  </Link>
                )}
                <Link to={`/company/challenges/${c.id}/edit`}
                  className="h-8 px-3 rounded-lg text-[12.5px] font-semibold hairline hover:bg-[var(--hair-2)] transition-colors"
                  style={{ color: isRejected ? 'var(--primary)' : 'var(--ink-2)' }}>
                  {isRejected ? 'Edit & Resubmit' : 'Edit'}
                </Link>
                {(isPending || isRejected) && (
                  <button
                    onClick={() => deleteChallenge.mutate({ challengeId: c.id, companyId: userId })}
                    disabled={deleteChallenge.isPending || isRejected}
                    className="h-8 px-3 rounded-lg text-[12.5px] font-semibold hairline hover:bg-[var(--rose-soft)] disabled:opacity-40 transition-colors"
                    style={{ color: 'var(--rose)' }}
                    title={isRejected ? 'Address the feedback and resubmit instead' : 'Delete challenge'}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      {Array.from({ length: 3 }).map((_, i) => <ChallengeRowSkeleton key={i} />)}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function MyChallenges() {
  const { user } = useAuthStore()
  const cid = user?.id ?? ''

  const { data: pending  = [] } = useCompanyPendingChallenges(cid)
  const { data: rejected = [] } = useCompanyRejectedChallenges(cid)

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

      <Tabs defaultValue="pending">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            Pending
            {pending.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white"
                style={{ background: 'var(--warn)' }}>{pending.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            {rejected.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white"
                style={{ background: 'var(--rose)' }}>{rejected.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="pending"><PendingTab companyId={cid} /></TabsContent>
        <TabsContent value="approved"><ApprovedTab companyId={cid} userId={cid} /></TabsContent>
        <TabsContent value="rejected"><RejectedTab companyId={cid} /></TabsContent>
        <TabsContent value="all"><AllTab companyId={cid} userId={cid} /></TabsContent>
      </Tabs>
    </div>
  )
}
