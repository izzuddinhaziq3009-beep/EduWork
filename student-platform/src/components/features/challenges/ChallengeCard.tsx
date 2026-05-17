import { Link } from 'react-router-dom'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { fmtDate } from '@/utils/formatters'
import type { ChallengeWithCompany } from '@/services/challengeService'

const COMPANY_COLORS = ['#1E5BFF', '#0F4C5C', '#2C9D6E', '#C97A2D', '#B8456A']
function companyColor(name: string) { return COMPANY_COLORS[name.charCodeAt(0) % COMPANY_COLORS.length] }

interface Props {
  challenge: ChallengeWithCompany
  hasSubmission?: boolean
}

export function ChallengeCard({ challenge, hasSubmission }: Props) {
  const isPast = new Date(challenge.deadline) < new Date()

  return (
    <div className="bg-surface hairline rounded-2xl shadow-card p-5 flex flex-col gap-4 hover:shadow-pop transition-shadow">
      {/* Company */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl grid place-items-center font-mono font-bold text-white text-[15px] shrink-0"
          style={{ background: companyColor(challenge.company.full_name) }}>
          {challenge.company.full_name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="text-[12px] font-mono muted truncate">{challenge.company.full_name}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <DifficultyBadge level={challenge.difficulty_level} />
            {hasSubmission && (
              <span className="tag" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>Submitted</span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        <h3 className="text-[16px] font-semibold leading-snug">{challenge.title}</h3>
        <p className="text-[13px] muted mt-1.5 line-clamp-2">{challenge.description}</p>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <span className={`text-[12px] font-mono ${isPast ? 'text-[color:var(--rose)]' : 'muted'}`}>
          {isPast ? 'Ended' : 'Deadline'} {fmtDate(challenge.deadline)}
        </span>
        <Link to={`/challenges/${challenge.id}`}
          className="h-8 px-3.5 rounded-xl text-[12.5px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--primary)' }}>
          View details
        </Link>
      </div>
    </div>
  )
}

export function ChallengeCardSkeleton() {
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-1.5"><Skeleton className="h-3 w-24" /><Skeleton className="h-5 w-16 rounded-full" /></div>
      </div>
      <div className="space-y-1.5"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-3 w-full" /></div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28" /><Skeleton className="h-8 w-24 rounded-xl" />
      </div>
    </div>
  )
}
