import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useCompanyDashboardStats, useAllCompanySubmissions } from '@/hooks/useCompany'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { fmtRelative, fmtInitials } from '@/utils/formatters'

const COLORS = ['#1E5BFF', '#0F4C5C', '#2C9D6E', '#C97A2D', '#B8456A']
function avatarColor(name: string) { return COLORS[name.charCodeAt(0) % COLORS.length] }

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  submitted:     { label: 'New',          bg: 'var(--warn-soft)',    color: 'var(--warn)'    },
  reviewing:     { label: 'Reviewing',    bg: 'var(--primary-soft)', color: 'var(--primary)' },
  feedback_given:{ label: 'Reviewed',     bg: 'var(--accent-soft)',  color: 'var(--accent)'  },
  completed:     { label: 'Completed',    bg: 'var(--accent-soft)',  color: 'var(--accent)'  },
}

export function CompanyDashboard() {
  const { user, profile } = useAuthStore()
  const cid = user?.id ?? ''

  const { data: stats, isLoading: loadingStats }         = useCompanyDashboardStats(cid)
  const { data: submissions = [], isLoading: loadingSubs } = useAllCompanySubmissions(cid)

  const companyName = profile?.full_name ?? 'Company'
  const recent = submissions.slice(0, 5)

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <div className="mb-8">
        <div className="font-mono text-[11px] tracking-[0.18em] muted uppercase mb-1">
          Today · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <h1 className="font-display text-[36px] font-semibold tracking-tight leading-[1.1]">
          Welcome, <span style={{ color: 'var(--primary)' }}>{companyName}</span>.
        </h1>
        <p className="muted text-[15px] mt-1.5">Review student submissions and manage your challenges.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {loadingStats ? Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-surface hairline rounded-2xl p-5 space-y-3">
            <Skeleton className="h-3 w-28" /><Skeleton className="h-10 w-16" />
          </div>
        )) : [
          { label: 'Challenges Posted',  value: stats?.totalChallenges  ?? 0, color: 'var(--primary)', to: '/company/challenges'   },
          { label: 'Total Submissions',  value: stats?.totalSubmissions ?? 0, color: 'var(--accent)',  to: '/company/submissions'  },
          { label: 'Pending Reviews',    value: stats?.pendingReviews   ?? 0, color: 'var(--warn)',    to: '/company/submissions'  },
        ].map(c => (
          <Link key={c.label} to={c.to}
            className="bg-surface hairline rounded-2xl shadow-card p-5 relative overflow-hidden hover:shadow-pop transition-shadow block">
            <div className="absolute top-0 left-0 h-1 w-10 rounded-br-lg" style={{ background: c.color }} />
            <div className="text-[11px] font-mono tracking-wide muted uppercase mb-2">{c.label}</div>
            <div className="font-display text-[42px] leading-none font-semibold"
              style={{ color: c.value > 0 ? c.color : 'var(--ink)' }}>{c.value}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Post new challenge', to: '/company/post-challenge', primary: true },
          { label: 'My challenges',      to: '/company/challenges',      primary: false },
          { label: 'All submissions',    to: '/company/submissions',     primary: false },
          { label: 'Company profile',    to: '/company/profile',         primary: false },
        ].map(a => (
          <Link key={a.to} to={a.to}
            className="h-10 rounded-xl flex items-center justify-center text-[13px] font-semibold transition-colors"
            style={a.primary
              ? { background: 'var(--primary)', color: '#fff' }
              : { border: '1px solid var(--hair)', color: 'var(--ink-2)', background: 'var(--surface)' }}>
            {a.label}
          </Link>
        ))}
      </div>

      {/* Recent submissions */}
      <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 hairline-b flex items-center justify-between">
          <h2 className="text-[16px] font-semibold">Recent submissions</h2>
          <Link to="/company/submissions" className="text-[12.5px] font-medium hover:underline"
            style={{ color: 'var(--primary)' }}>View all</Link>
        </div>
        {loadingSubs ? (
          <div className="divide-y divide-[var(--hair)]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="px-6 py-12 text-center text-[13px] muted">
            No submissions yet — post a challenge to get started.
          </div>
        ) : (
          <div className="divide-y divide-[var(--hair)]">
            {recent.map(({ submission, challenge, student }) => {
              const st = STATUS_STYLE[submission.status] ?? STATUS_STYLE.submitted
              return (
                <Link key={submission.id} to={`/company/submissions/${submission.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--hair-2)] transition-colors">
                  <div className="w-9 h-9 rounded-lg grid place-items-center font-mono font-semibold text-white text-[12px] shrink-0"
                    style={{ background: avatarColor(student.full_name) }}>
                    {fmtInitials(student.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium truncate">{challenge.title}</div>
                    <div className="text-[12px] muted">{student.full_name} · {fmtRelative(submission.submitted_at)}</div>
                  </div>
                  <span className="tag shrink-0" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
