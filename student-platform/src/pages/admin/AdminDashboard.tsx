import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useSystemStats, useRecentActivity } from '@/hooks/useAdmin'
import { Skeleton } from '@/components/ui/skeleton'
import { fmtRelative } from '@/utils/formatters'

const ACTION_ICONS: Record<string, string> = {
  module_enrolled:    '📚',
  module_completed:   '✅',
  project_submitted:  '📁',
  mentorship_request: '🤝',
  mentorship_accepted:'🎓',
  challenge_submitted:'🏆',
  challenge_approved: '⭐',
  feedback_given:     '💬',
  user_signup:        '👤',
}

export function AdminDashboard() {
  const { profile } = useAuthStore()
  const { data: stats,    isLoading: loadingStats    } = useSystemStats()
  const { data: activity, isLoading: loadingActivity } = useRecentActivity()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Admin'

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <div className="font-mono text-[11px] tracking-[0.18em] muted uppercase mb-1">
          Today · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <h1 className="font-display text-[36px] font-semibold tracking-tight leading-[1.1]">
          Admin Panel, <span style={{ color: 'var(--primary)' }}>{firstName}</span>.
        </h1>
        <p className="muted text-[15px] mt-1.5">Platform overview and management tools.</p>
      </div>

      {/* User stats */}
      <div className="mb-3">
        <div className="font-mono text-[11px] tracking-[0.14em] muted uppercase mb-3">Users</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {loadingStats ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface hairline rounded-2xl p-4 space-y-2">
              <Skeleton className="h-3 w-20" /><Skeleton className="h-8 w-12" />
            </div>
          )) : [
            { label: 'Students',   value: stats?.students   ?? 0, color: 'var(--primary)', to: '/admin/users?role=student' },
            { label: 'Mentors',    value: stats?.mentors    ?? 0, color: 'var(--accent)',  to: '/admin/users?role=mentor'  },
            { label: 'Companies',  value: stats?.companies  ?? 0, color: 'var(--warn)',    to: '/admin/users?role=company' },
            { label: 'Total Users',value: stats?.totalUsers ?? 0, color: 'var(--rose)',    to: '/admin/users'              },
          ].map(c => (
            <Link key={c.label} to={c.to}
              className="bg-surface hairline rounded-2xl shadow-card p-4 relative overflow-hidden hover:shadow-pop transition-shadow block">
              <div className="absolute top-0 left-0 h-1 w-8 rounded-br-lg" style={{ background: c.color }} />
              <div className="text-[11px] font-mono tracking-wide muted uppercase mb-1.5">{c.label}</div>
              <div className="font-display text-[36px] leading-none font-semibold"
                style={{ color: c.value > 0 ? c.color : 'var(--ink)' }}>{c.value}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Content stats */}
      <div className="mb-3 mt-6">
        <div className="font-mono text-[11px] tracking-[0.14em] muted uppercase mb-3">Content</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {loadingStats ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface hairline rounded-2xl p-4 space-y-2">
              <Skeleton className="h-3 w-20" /><Skeleton className="h-8 w-12" />
            </div>
          )) : [
            { label: 'Active Modules',    value: stats?.activeModules     ?? 0, color: 'var(--primary)', to: '/admin/content'     },
            { label: 'Active Projects',   value: stats?.activeProjects    ?? 0, color: 'var(--accent)',  to: '/admin/content'     },
            { label: 'Live Challenges',   value: stats?.activeChallenges  ?? 0, color: 'var(--warn)',    to: '/admin/challenges'  },
            { label: 'Pending Approval',  value: stats?.pendingChallenges ?? 0, color: 'var(--rose)',    to: '/admin/challenges'  },
            { label: 'Total Submissions', value: stats?.totalSubmissions  ?? 0, color: 'var(--muted)',   to: '/admin/monitoring'  },
          ].map(c => (
            <Link key={c.label} to={c.to}
              className="bg-surface hairline rounded-2xl shadow-card p-4 relative overflow-hidden hover:shadow-pop transition-shadow block">
              <div className="absolute top-0 left-0 h-1 w-8 rounded-br-lg" style={{ background: c.color }} />
              <div className="text-[11px] font-mono tracking-wide muted uppercase mb-1.5">{c.label}</div>
              <div className="font-display text-[32px] leading-none font-semibold"
                style={{ color: c.value > 0 ? c.color : 'var(--ink)' }}>{c.value}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Completion rates */}
      <div className="mt-6 grid sm:grid-cols-3 gap-4 mb-8">
        {loadingStats ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />) :
        [
          { label: 'Module completion rate', value: stats?.moduleCompletionRate  ?? 0, color: 'var(--primary)' },
          { label: 'Project approval rate',  value: stats?.projectApprovalRate   ?? 0, color: 'var(--accent)'  },
          { label: 'Challenge completion',   value: stats?.challengeCompletionRate ?? 0, color: 'var(--warn)'  },
        ].map(c => (
          <div key={c.label} className="bg-surface hairline rounded-2xl shadow-card p-4">
            <div className="text-[11.5px] font-mono tracking-wide muted uppercase mb-2">{c.label}</div>
            <div className="font-display text-[36px] font-semibold" style={{ color: c.color }}>{c.value}%</div>
            <div className="pbar mt-2" style={{ height: 6 }}>
              <span style={{ width: `${c.value}%`, background: c.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Manage users',        to: '/admin/users',      primary: false },
          { label: 'Approve challenges',  to: '/admin/challenges', primary: true  },
          { label: 'Manage content',      to: '/admin/content',    primary: false },
          { label: 'System logs',         to: '/admin/monitoring', primary: false },
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

      {/* Activity feed */}
      <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 hairline-b flex items-center justify-between">
          <h2 className="text-[16px] font-semibold">Recent activity</h2>
          <Link to="/admin/monitoring" className="text-[12.5px] font-medium hover:underline"
            style={{ color: 'var(--primary)' }}>View all</Link>
        </div>
        {loadingActivity ? (
          <div className="divide-y divide-[var(--hair)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-3.5">
                <Skeleton className="w-8 h-8 rounded-xl" />
                <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-1/2" /><Skeleton className="h-3 w-1/3" /></div>
              </div>
            ))}
          </div>
        ) : !activity?.length ? (
          <div className="px-6 py-12 text-center text-[13px] muted">No activity recorded yet.</div>
        ) : (
          <div className="divide-y divide-[var(--hair)] max-h-[420px] overflow-y-auto scroll-thin">
            {activity.map(log => (
              <div key={log.id} className="flex items-center gap-3 px-6 py-3">
                <div className="w-8 h-8 rounded-xl grid place-items-center text-lg shrink-0"
                  style={{ background: 'var(--hair-2)' }}>
                  {ACTION_ICONS[log.action] ?? '📋'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium truncate">{log.description}</div>
                  <div className="text-[11.5px] font-mono muted">{log.action}</div>
                </div>
                <div className="text-[11.5px] font-mono muted shrink-0">{fmtRelative(log.created_at)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
