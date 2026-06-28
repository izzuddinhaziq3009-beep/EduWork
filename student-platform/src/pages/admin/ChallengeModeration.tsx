import { useState } from 'react'
import {
  usePendingChallenges, useApprovedChallenges, useRejectedChallenges,
  useAllChallengesAdmin, useApproveChallenge, useRejectChallenge,
} from '@/hooks/useAdmin'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { fmtDate, fmtRelative, fmtInitials } from '@/utils/formatters'
import type { ChallengeWithCompanyProfile } from '@/services/adminService'

const COMPANY_COLORS = ['#1E5BFF', '#0F4C5C', '#2C9D6E', '#C97A2D', '#B8456A']
function cColor(name: string) { return COMPANY_COLORS[name.charCodeAt(0) % COMPANY_COLORS.length] }

function ChallengeRow({
  c, showActions, onApprove, onReject, approving, rejecting,
}: {
  c: ChallengeWithCompanyProfile
  showActions: boolean
  onApprove?: (c: ChallengeWithCompanyProfile) => void
  onReject?:  (c: ChallengeWithCompanyProfile) => void
  approving: boolean
  rejecting: boolean
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 px-4 sm:px-6 py-4">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-xl grid place-items-center font-mono font-bold text-white text-[12px] shrink-0 mt-0.5"
          style={{ background: cColor(c.company.full_name) }}>
          {fmtInitials(c.company.full_name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-[14.5px] font-semibold">{c.title}</span>
            <DifficultyBadge level={c.difficulty_level} />
            {c.is_approved && (
              <span className="tag" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>Approved</span>
            )}
          </div>
          <div className="text-[12px] font-mono muted">
            {c.company.full_name} · Deadline {fmtDate(c.deadline)} · Posted {fmtRelative(c.created_at)}
          </div>
          {/* Show rejection reason if present */}
          {c.rejection_reason && (
            <div className="mt-2 text-[12.5px] ink-2 hairline rounded-lg px-3 py-2 leading-relaxed"
              style={{ background: 'var(--rose-soft)', borderColor: 'var(--rose)' }}>
              <span className="font-semibold" style={{ color: 'var(--rose)' }}>Rejection reason: </span>
              {c.rejection_reason}
              {c.rejected_at && <span className="muted ml-2">· {fmtRelative(c.rejected_at)}</span>}
            </div>
          )}
        </div>
      </div>
      {showActions && (
        <div className="flex gap-2 shrink-0">
          <button onClick={() => onReject?.(c)} disabled={rejecting || approving}
            className="flex-1 sm:flex-none h-9 px-3.5 rounded-xl hairline text-[13px] font-semibold hover:bg-[var(--rose-soft)] disabled:opacity-60 transition-colors"
            style={{ color: 'var(--rose)' }}>
            Reject
          </button>
          <button onClick={() => onApprove?.(c)} disabled={approving || rejecting}
            className="flex-1 sm:flex-none h-9 px-4 rounded-xl text-[13px] font-semibold text-white disabled:opacity-60 transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)' }}>
            {approving ? '…' : 'Approve'}
          </button>
        </div>
      )}
    </div>
  )
}

function ChallengeTable({
  challenges, isLoading, showActions, onApprove, onReject, approving, rejecting, emptyTitle, emptyDesc,
}: {
  challenges: ChallengeWithCompanyProfile[]
  isLoading: boolean
  showActions: boolean
  onApprove?: (c: ChallengeWithCompanyProfile) => void
  onReject?:  (c: ChallengeWithCompanyProfile) => void
  approving: boolean
  rejecting: boolean
  emptyTitle: string
  emptyDesc?: string
}) {
  if (isLoading) {
    return (
      <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-[var(--hair)]">
            <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div>
            {showActions && <Skeleton className="h-9 w-28 rounded-xl" />}
          </div>
        ))}
      </div>
    )
  }

  if (challenges.length === 0) {
    return (
      <EmptyState
        icon={<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4"/><path d="M5 5h12l-2 4 2 4H5"/></svg>}
        title={emptyTitle}
        description={emptyDesc}
      />
    )
  }

  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      <div className="divide-y divide-[var(--hair)]">
        {challenges.map(c => (
          <ChallengeRow
            key={c.id}
            c={c}
            showActions={showActions}
            onApprove={onApprove}
            onReject={onReject}
            approving={approving}
            rejecting={rejecting}
          />
        ))}
      </div>
    </div>
  )
}

export function ChallengeModeration() {
  const [rejectTarget, setRejectTarget] = useState<ChallengeWithCompanyProfile | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [reasonError, setReasonError]   = useState('')

  const { data: pending  = [], isLoading: l1 } = usePendingChallenges()
  const { data: approved = [], isLoading: l2 } = useApprovedChallenges()
  const { data: rejected = [], isLoading: l3 } = useRejectedChallenges()
  const { data: all      = [], isLoading: l4 } = useAllChallengesAdmin()

  const approve = useApproveChallenge()
  const reject  = useRejectChallenge()

  const handleApprove = (c: ChallengeWithCompanyProfile) => {
    approve.mutate({ challengeId: c.id, companyId: c.company_id, title: c.title })
  }

  const handleRejectSubmit = () => {
    if (!rejectTarget) return
    if (!rejectReason.trim()) { setReasonError('Please provide a rejection reason.'); return }
    setReasonError('')
    reject.mutate(
      { challengeId: rejectTarget.id, companyId: rejectTarget.company_id, title: rejectTarget.title, reason: rejectReason.trim() },
      { onSuccess: () => { setRejectTarget(null); setRejectReason('') } },
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1100px]">
      <PageHeader
        label="Challenge queue"
        title="Challenge Moderation"
        description="Review and approve or reject challenges posted by companies."
      />

      {pending.length > 0 && (
        <div className="hairline rounded-xl px-4 py-3 mb-6 flex items-center gap-2.5"
          style={{ background: 'var(--rose-soft)', borderColor: 'var(--rose)' }}>
          <span style={{ color: 'var(--rose)' }} className="text-[13px] font-medium">
            {pending.length} challenge{pending.length !== 1 ? 's' : ''} awaiting your approval
          </span>
        </div>
      )}

      <Tabs defaultValue="pending">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            Pending
            {pending.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white"
                style={{ background: 'var(--rose)' }}>{pending.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            {rejected.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 rounded-full text-[10px] font-bold text-white px-1"
                style={{ background: 'var(--muted)' }}>{rejected.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All ({all.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <ChallengeTable
            challenges={pending} isLoading={l1} showActions
            onApprove={handleApprove} onReject={c => setRejectTarget(c)}
            approving={approve.isPending} rejecting={reject.isPending}
            emptyTitle="No pending challenges" emptyDesc="All challenges have been reviewed."
          />
        </TabsContent>

        <TabsContent value="approved">
          <ChallengeTable
            challenges={approved} isLoading={l2} showActions={false}
            approving={false} rejecting={false}
            emptyTitle="No approved challenges yet"
          />
        </TabsContent>

        <TabsContent value="rejected">
          <ChallengeTable
            challenges={rejected} isLoading={l3} showActions={false}
            approving={false} rejecting={false}
            emptyTitle="No rejected challenges"
            emptyDesc="Challenges you reject will appear here with their reasons."
          />
        </TabsContent>

        <TabsContent value="all">
          <ChallengeTable
            challenges={all} isLoading={l4} showActions={false}
            approving={false} rejecting={false}
            emptyTitle="No challenges posted yet"
          />
        </TabsContent>
      </Tabs>

      {/* Reject dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={open => !open && setRejectTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject challenge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-[13.5px] ink-2">
              Rejecting <strong>{rejectTarget?.title}</strong>. The company will be notified with your reason.
            </p>
            <div>
              <label className="text-[12.5px] font-medium ink-2 block mb-1.5">Rejection reason</label>
              <Textarea
                value={rejectReason}
                onChange={e => { setRejectReason(e.target.value); setReasonError('') }}
                rows={4}
                placeholder="Explain why this challenge doesn't meet the platform requirements…"
              />
              {reasonError && <div className="text-[12px] mt-1" style={{ color: 'var(--rose)' }}>{reasonError}</div>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setRejectTarget(null)}
                className="h-10 rounded-xl hairline text-[13px] font-semibold hover:bg-[var(--hair-2)] transition-colors">
                Cancel
              </button>
              <button onClick={handleRejectSubmit} disabled={reject.isPending}
                className="h-10 rounded-xl text-[13px] font-semibold text-white disabled:opacity-60 hover:opacity-90 transition-opacity"
                style={{ background: 'var(--rose)' }}>
                {reject.isPending ? 'Rejecting…' : 'Confirm rejection'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
