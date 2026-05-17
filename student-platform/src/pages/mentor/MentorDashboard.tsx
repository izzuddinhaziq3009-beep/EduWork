import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useMentorDashboardStats, useMentorSubmissions, useMentorshipRequests } from '@/hooks/useMentor'
import { SubmissionStatus } from '@/components/features/projects/SubmissionStatus'
import { Skeleton } from '@/components/ui/skeleton'
import { fmtRelative, fmtInitials } from '@/utils/formatters'

const COLORS = ['#0F4C5C', '#2C9D6E', '#C97A2D', '#B8456A', '#3B6AC9']
function avatarColor(name: string) { return COLORS[name.charCodeAt(0) % COLORS.length] }

export function MentorDashboard() {
  const { user, profile } = useAuthStore()
  const mid = user?.id ?? ''

  const { data: stats, isLoading: loadingStats }     = useMentorDashboardStats(mid)
  const { data: submissions = [], isLoading: loadingSubs } = useMentorSubmissions(mid)
  const { data: requests = [],    isLoading: loadingReqs } = useMentorshipRequests(mid)

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Mentor'
  const recent    = submissions.slice(0, 5)

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <div className="font-mono text-[11px] tracking-[0.18em] muted uppercase mb-1">
          Today · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <h1 className="font-display text-[36px] font-semibold tracking-tight leading-[1.1]">
          Welcome, <span style={{ color: 'var(--primary)' }}>{firstName}</span>.
        </h1>
        <p className="muted text-[15px] mt-1.5">Your mentor workspace — students are counting on your feedback.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {loadingStats ? Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-surface hairline rounded-2xl p-5 space-y-3">
            <Skeleton className="h-3 w-28" /><Skeleton className="h-10 w-16" />
          </div>
        )) : [
          { label: 'Pending Reviews',   value: stats?.pendingReviews  ?? 0, color: 'var(--warn)',    to: '/mentor/submissions'         },
          { label: 'Pending Requests',  value: stats?.pendingRequests ?? 0, color: 'var(--rose)',    to: '/mentor/mentorship-requests' },
          { label: 'Active Mentees',    value: stats?.activeMentees   ?? 0, color: 'var(--accent)',  to: '/mentor/mentorship-requests' },
        ].map(c => (
          <Link key={c.label} to={c.to}
            className="bg-surface hairline rounded-2xl shadow-card p-5 relative overflow-hidden hover:shadow-pop transition-shadow block">
            <div className="absolute top-0 left-0 h-1 w-10 rounded-br-lg" style={{ background: c.color }} />
            <div className="text-[11px] font-mono tracking-wide muted uppercase mb-2">{c.label}</div>
            <div className="font-display text-[42px] leading-none font-semibold"
              style={{ color: c.value > 0 ? c.color : 'var(--ink)' }}>
              {c.value}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        {/* Recent submissions */}
        <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
          <div className="px-6 py-4 hairline-b flex items-center justify-between">
            <h2 className="text-[16px] font-semibold">Recent submissions</h2>
            <Link to="/mentor/submissions" className="text-[12.5px] font-medium hover:underline"
              style={{ color: 'var(--primary)' }}>View all</Link>
          </div>
          {loadingSubs ? (
            <div className="divide-y divide-[var(--hair)]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4">
                  <Skeleton className="w-9 h-9 rounded-lg" />
                  <div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="px-6 py-12 text-center text-[13px] muted">
              No submissions yet — students will appear here once they submit projects.
            </div>
          ) : (
            <div className="divide-y divide-[var(--hair)]">
              {recent.map(({ submission, project, student }) => (
                <Link key={submission.id} to={`/mentor/submissions/${submission.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--hair-2)] transition-colors">
                  <div className="w-9 h-9 rounded-lg grid place-items-center font-mono font-semibold text-white text-[12px] shrink-0"
                    style={{ background: avatarColor(student.full_name) }}>
                    {fmtInitials(student.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium truncate">{project.title}</div>
                    <div className="text-[12px] muted">{student.full_name} · {fmtRelative(submission.submitted_at)}</div>
                  </div>
                  <SubmissionStatus status={submission.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Pending mentorship requests */}
        <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
          <div className="px-5 py-4 hairline-b flex items-center justify-between">
            <h2 className="text-[16px] font-semibold">Pending requests</h2>
            <Link to="/mentor/mentorship-requests" className="text-[12.5px] font-medium hover:underline"
              style={{ color: 'var(--primary)' }}>View all</Link>
          </div>
          {loadingReqs ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : requests.length === 0 ? (
            <div className="px-5 py-12 text-center text-[13px] muted">No pending requests.</div>
          ) : (
            <div className="divide-y divide-[var(--hair)]">
              {requests.slice(0, 4).map(req => (
                <div key={req.id} className="px-5 py-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg grid place-items-center font-mono font-semibold text-white text-[11px] shrink-0"
                      style={{ background: avatarColor(req.student.full_name) }}>
                      {fmtInitials(req.student.full_name)}
                    </div>
                    <div>
                      <div className="text-[13.5px] font-semibold leading-tight">{req.student.full_name}</div>
                      <div className="text-[11px] muted font-mono">{fmtRelative(req.created_at)}</div>
                    </div>
                  </div>
                  <p className="text-[12.5px] muted line-clamp-2">{req.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
