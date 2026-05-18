import { useParams, Link } from 'react-router-dom'
import { useAdminUser, useAdminUserStats } from '@/hooks/useAdmin'
import { Skeleton } from '@/components/ui/skeleton'
import { fmtDate, fmtInitials } from '@/utils/formatters'

const ROLE_COLORS = { student: 'var(--primary)', mentor: 'var(--accent)', company: 'var(--warn)', admin: 'var(--rose)' }
const AVATAR_COLORS = ['#0F4C5C','#2C9D6E','#C97A2D','#B8456A','#3B6AC9']
function avatarColor(n: string) { return AVATAR_COLORS[n.charCodeAt(0) % AVATAR_COLORS.length] }

export function UserDetail() {
  const { id = '' } = useParams()
  const { data: user,  isLoading: l1 } = useAdminUser(id)
  const { data: stats, isLoading: l2 } = useAdminUserStats(id, user?.role ?? 'student')

  if (l1) return (
    <div className="p-6 lg:p-8 max-w-[700px]">
      <Skeleton className="h-4 w-32 mb-6" />
      <div className="bg-surface hairline rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-4"><Skeleton className="w-14 h-14 rounded-2xl" /><div className="space-y-2"><Skeleton className="h-5 w-40" /><Skeleton className="h-3 w-28" /></div></div>
        <div className="grid grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      </div>
    </div>
  )

  if (!user) return <div className="p-8 muted">User not found.</div>

  const roleColor = ROLE_COLORS[user.role]

  const ROLE_STATS = {
    student: [
      { label: 'Modules completed',   value: stats?.modulesCompleted   ?? 0 },
      { label: 'Projects submitted',  value: stats?.projectsSubmitted  ?? 0 },
      { label: 'Challenges submitted',value: stats?.challengesSubmitted ?? 0 },
    ],
    mentor: [
      { label: 'Students assigned', value: stats?.studentsAssigned ?? 0 },
      { label: 'Feedback given',    value: stats?.feedbackGiven    ?? 0 },
    ],
    company: [
      { label: 'Challenges posted',    value: stats?.challengesPosted    ?? 0 },
      { label: 'Submissions received', value: stats?.submissionsReceived ?? 0 },
    ],
    admin: [],
  }

  return (
    <div className="p-6 lg:p-8 max-w-[700px]">
      <Link to="/admin/users"
        className="text-[13px] font-medium flex items-center gap-1.5 mb-6"
        style={{ color: 'var(--primary)' }}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to users
      </Link>

      <div className="bg-surface hairline rounded-2xl shadow-card p-6 space-y-6">
        {/* Profile header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl grid place-items-center font-mono font-bold text-white text-[18px] shrink-0"
            style={{ background: avatarColor(user.full_name) }}>
            {fmtInitials(user.full_name)}
          </div>
          <div>
            <div className="text-[20px] font-semibold">{user.full_name}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="tag capitalize" style={{
                background: `${roleColor}20`,
                color: roleColor,
              }}>{user.role}</span>
              <span className="tag" style={user.is_active !== false
                ? { background: 'var(--accent-soft)', color: 'var(--accent)' }
                : { background: 'var(--rose-soft)',   color: 'var(--rose)'   }}>
                {user.is_active !== false ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Email',    value: user.email           },
            { label: 'Joined',   value: fmtDate(user.created_at) },
            { label: 'User ID',  value: user.id.slice(0, 16) + '…' },
            ...(user.company_industry ? [{ label: 'Industry', value: user.company_industry }] : []),
            ...(user.company_website  ? [{ label: 'Website',  value: user.company_website  }] : []),
          ].map(d => (
            <div key={d.label} className="hairline rounded-xl p-3" style={{ background: '#FBFAF5' }}>
              <div className="text-[11px] font-mono muted uppercase tracking-wide">{d.label}</div>
              <div className="text-[13.5px] font-medium mt-0.5 truncate">{d.value}</div>
            </div>
          ))}
        </div>

        {/* Role-specific stats */}
        {ROLE_STATS[user.role].length > 0 && (
          <div>
            <div className="text-[12px] font-mono muted uppercase tracking-wide mb-3">Activity summary</div>
            {l2 ? (
              <div className="grid grid-cols-3 gap-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {ROLE_STATS[user.role].map(s => (
                  <div key={s.label} className="hairline rounded-xl p-3 text-center" style={{ background: '#FBFAF5' }}>
                    <div className="font-display text-[28px] font-semibold leading-none" style={{ color: roleColor }}>{s.value}</div>
                    <div className="text-[11px] font-mono muted mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Company description */}
        {user.company_description && (
          <div>
            <div className="text-[12px] font-mono muted uppercase tracking-wide mb-2">About</div>
            <p className="text-[13.5px] ink-2 leading-relaxed">{user.company_description}</p>
          </div>
        )}
      </div>
    </div>
  )
}
