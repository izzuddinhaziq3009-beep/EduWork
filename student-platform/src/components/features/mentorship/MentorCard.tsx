import { Skeleton } from '@/components/ui/skeleton'
import { fmtInitials } from '@/utils/formatters'
import type { Profile } from '@/types'

const COLORS = ['#0F4C5C','#2C9D6E','#C97A2D','#B8456A','#3B6AC9']

interface Props {
  mentor: Profile
  hasRequest?: boolean
  onRequest: () => void
  requesting?: boolean
}

export function MentorCard({ mentor, hasRequest, onRequest, requesting }: Props) {
  const color = COLORS[mentor.full_name.charCodeAt(0) % COLORS.length]

  return (
    <div className="bg-surface hairline rounded-2xl shadow-card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl grid place-items-center font-mono font-semibold text-white shrink-0"
          style={{ background: color, fontSize: 16 }}>
          {fmtInitials(mentor.full_name)}
        </div>
        <div className="min-w-0">
          <div className="text-[15px] font-semibold truncate">{mentor.full_name}</div>
          <div className="text-[12px] muted font-mono">Mentor</div>
        </div>
      </div>

      <p className="text-[13px] muted leading-relaxed line-clamp-3">
        Experienced mentor ready to guide students through their learning journey.
      </p>

      <button
        onClick={onRequest}
        disabled={hasRequest || requesting}
        className="h-9 rounded-xl flex items-center justify-center text-[13px] font-semibold transition-colors disabled:opacity-60"
        style={hasRequest
          ? { background: 'var(--accent-soft)', color: 'var(--accent)' }
          : { background: 'var(--primary)', color: '#fff' }}>
        {requesting ? 'Sending…' : hasRequest ? '✓ Request sent' : 'Request mentorship'}
      </button>
    </div>
  )
}

export function MentorCardSkeleton() {
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-9 w-full rounded-xl" />
    </div>
  )
}
