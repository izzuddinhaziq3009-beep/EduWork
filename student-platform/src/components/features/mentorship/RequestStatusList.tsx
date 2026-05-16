import { fmtRelative } from '@/utils/formatters'
import type { MentorshipRequest, MentorshipStatus } from '@/types'

const STATUS_CONFIG: Record<MentorshipStatus, { label: string; bg: string; color: string }> = {
  pending:  { label: 'Pending',  bg: 'var(--warn-soft)',    color: 'var(--warn)'    },
  accepted: { label: 'Accepted', bg: 'var(--accent-soft)',  color: 'var(--accent)'  },
  rejected: { label: 'Declined', bg: 'var(--rose-soft)',    color: 'var(--rose)'    },
}

export function RequestStatusList({ requests }: { requests: MentorshipRequest[] }) {
  return (
    <div className="space-y-3">
      {requests.map(req => {
        const { label, bg, color } = STATUS_CONFIG[req.status]
        return (
          <div key={req.id} className="bg-surface hairline rounded-2xl p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0"
              style={{ background: bg, color }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="8" r="3.5"/><path d="M2 21c.7-3.6 3.6-5.5 7-5.5s6.3 1.9 7 5.5"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[14px] font-semibold">Mentorship request</span>
                <span className="tag" style={{ background: bg, color }}>{label}</span>
              </div>
              <p className="text-[13px] muted mt-1 line-clamp-2">{req.message}</p>
              <div className="text-[11.5px] muted font-mono mt-1">{fmtRelative(req.created_at)}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
