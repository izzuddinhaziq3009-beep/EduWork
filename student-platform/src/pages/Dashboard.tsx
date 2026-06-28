import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useOverallProgress, useModuleProgressDetails, useProjectProgressDetails, useUserActivity } from '@/hooks/useProgress'
import { useStudentMentor, useStudentRequests } from '@/hooks/useMentorship'
import { useActiveChallenges, useStudentChallengeSubmissions } from '@/hooks/useChallenges'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'
import { SubmissionStatus } from '@/components/features/projects/SubmissionStatus'
import { Skeleton } from '@/components/ui/skeleton'
import { fmtRelative, fmtDate, fmtInitials } from '@/utils/formatters'

const ACTION_ICONS: Record<string, string> = {
  module_enrolled:     '📚',
  module_completed:    '✅',
  project_submitted:   '📁',
  mentorship_request:  '🤝',
  mentorship_accepted: '🎓',
  challenge_submitted: '🏆',
  challenge_approved:  '⭐',
  feedback_given:      '💬',
}

const MENTOR_COLORS = ['#0F4C5C', '#2C9D6E', '#C97A2D', '#B8456A', '#3B6AC9']
function avatarColor(name: string) { return MENTOR_COLORS[name.charCodeAt(0) % MENTOR_COLORS.length] }

export function Dashboard() {
  const { user, profile } = useAuthStore()
  const sid = user?.id ?? ''
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Student'

  const { data: overall,         isLoading: loadingOverall   } = useOverallProgress(sid)
  const { data: mentor,          isLoading: loadingMentor    } = useStudentMentor(sid)
  const { data: requests = [] }                                = useStudentRequests(sid)
  const { data: modules = [],    isLoading: loadingModules   } = useModuleProgressDetails(sid)
  const { data: projects = [],   isLoading: loadingProjects  } = useProjectProgressDetails(sid)
  const { data: challenges = [], isLoading: loadingChallenges } = useActiveChallenges()
  const { data: challengeSubs = [] }                            = useStudentChallengeSubmissions(sid)
  const { data: activity = [],   isLoading: loadingActivity  } = useUserActivity(sid)

  const loadingKpi = loadingOverall || loadingMentor

  const overallPct = overall
    ? Math.round(
        ((overall.completedModules + overall.approvedSubmissions) /
          Math.max(1, overall.totalModules + overall.totalSubmissions)) * 100,
      )
    : 0

  const recentModules  = modules.slice(0, 4)
  const recentProjects = projects.slice(0, 3)
  const pendingRequests = requests.filter(r => r.status === 'pending').length

  const submittedChallengeIds = new Set(challengeSubs.map(s => s.challenge_id))
  const upcomingChallenges = challenges
    .filter(c => !submittedChallengeIds.has(c.id))
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <div className="font-mono text-[11px] tracking-[0.18em] muted uppercase mb-1">
          Today · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <h1 className="font-display text-[28px] sm:text-[32px] lg:text-[38px] font-semibold tracking-tight leading-[1.05]">
          Welcome back, <span style={{ color: 'var(--primary)' }}>{firstName}</span>.
        </h1>
        <p className="muted text-[14px] sm:text-[15px] mt-2 max-w-[600px]">
          Here's what's happening across your modules, projects, mentorship, and challenges.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {loadingKpi ? Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface hairline rounded-2xl shadow-card p-5 space-y-3">
            <Skeleton className="h-3 w-24" /><Skeleton className="h-10 w-14" />
          </div>
        )) : [
          { label: 'Modules Completed',  value: overall?.completedModules ?? 0,    color: 'var(--primary)', to: '/modules'    },
          { label: 'Projects Submitted', value: overall?.totalSubmissions ?? 0,    color: 'var(--accent)',  to: '/projects'   },
          { label: 'Active Mentorship',  value: mentor ? 1 : 0,                    color: 'var(--warn)',    to: '/mentorship' },
          { label: 'Challenges',         value: overall?.challengesAttempted ?? 0, color: 'var(--rose)',    to: '/challenges' },
        ].map(card => (
          <Link key={card.label} to={card.to}
            className="bg-surface hairline rounded-2xl shadow-card p-5 relative overflow-hidden hover:shadow-pop transition-shadow block">
            <div className="absolute top-0 left-0 h-1 w-12 rounded-br-lg" style={{ background: card.color }} />
            <div className="text-[12px] font-mono tracking-wide muted uppercase mb-3">{card.label}</div>
            <div className="font-display text-[42px] leading-none font-semibold tracking-tight"
              style={{ color: card.value > 0 ? card.color : 'var(--ink)' }}>{card.value}</div>
          </Link>
        ))}
      </div>

      {/* Overall progress strip */}
      <div className="bg-surface hairline rounded-2xl shadow-card p-5 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-semibold">Overall progress</span>
          <span className="font-mono text-[13px] font-semibold" style={{ color: 'var(--primary)' }}>
            {loadingKpi ? '—' : `${overallPct}%`}
          </span>
        </div>
        <div className="pbar teal" style={{ height: 8 }}><span style={{ width: `${overallPct}%` }} /></div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-6 mb-8">
        {/* Left column */}
        <div className="space-y-6 min-w-0">
          {/* Continue learning */}
          <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
            <div className="px-6 py-4 hairline-b flex items-center justify-between">
              <h2 className="text-[16px] font-semibold">Continue learning</h2>
              <Link to="/modules" className="text-[12.5px] font-medium hover:underline" style={{ color: 'var(--primary)' }}>View all</Link>
            </div>
            {loadingModules ? (
              <div className="divide-y divide-[var(--hair)]">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4">
                    <div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-2 w-full" /></div>
                  </div>
                ))}
              </div>
            ) : recentModules.length === 0 ? (
              <div className="px-6 py-10 text-center text-[13px] muted">
                You haven't enrolled in any modules yet.{' '}
                <Link to="/modules" className="font-medium" style={{ color: 'var(--primary)' }}>Browse modules →</Link>
              </div>
            ) : (
              <div className="divide-y divide-[var(--hair)]">
                {recentModules.map(({ progress, module }) => (
                  <Link key={progress.id} to={`/modules/${module.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--hair-2)] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[14px] font-medium truncate">{module.title}</span>
                        <DifficultyBadge level={module.difficulty_level} />
                      </div>
                      <div className="pbar" style={{ height: 5 }}>
                        <span style={{ width: `${progress.progress}%`, background: progress.completed ? 'var(--accent)' : 'var(--primary)' }} />
                      </div>
                    </div>
                    <span className="font-mono text-[12px] muted shrink-0">
                      {progress.completed ? '✓ Done' : `${progress.progress}%`}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent projects */}
          <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
            <div className="px-6 py-4 hairline-b flex items-center justify-between">
              <h2 className="text-[16px] font-semibold">Recent projects</h2>
              <Link to="/projects" className="text-[12.5px] font-medium hover:underline" style={{ color: 'var(--primary)' }}>View all</Link>
            </div>
            {loadingProjects ? (
              <div className="divide-y divide-[var(--hair)]">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4">
                    <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="px-6 py-10 text-center text-[13px] muted">
                No project submissions yet.{' '}
                <Link to="/projects" className="font-medium" style={{ color: 'var(--primary)' }}>View projects →</Link>
              </div>
            ) : (
              <div className="divide-y divide-[var(--hair)]">
                {recentProjects.map(({ submission, project }) => (
                  <Link key={submission.id} to={`/projects/${project.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--hair-2)] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium truncate">{project.title}</div>
                      <div className="text-[12px] muted mt-0.5">Submitted {fmtRelative(submission.submitted_at)}</div>
                    </div>
                    <SubmissionStatus status={submission.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6 min-w-0">
          {/* Mentorship status */}
          <div className="bg-surface hairline rounded-2xl shadow-card p-5">
            <h2 className="text-[16px] font-semibold mb-4">Mentorship</h2>
            {loadingMentor ? (
              <Skeleton className="h-14 w-full rounded-xl" />
            ) : mentor ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg grid place-items-center font-mono font-semibold text-white text-[13px] shrink-0"
                  style={{ background: avatarColor(mentor.full_name) }}>
                  {fmtInitials(mentor.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold truncate">{mentor.full_name}</div>
                  <div className="text-[11.5px] muted">Your mentor</div>
                </div>
                <Link to="/messages"
                  className="h-8 px-3 rounded-lg text-[12px] font-semibold hairline hover:bg-[var(--hair-2)] shrink-0 transition-colors"
                  style={{ color: 'var(--primary)' }}>
                  Message
                </Link>
              </div>
            ) : pendingRequests > 0 ? (
              <p className="text-[13px] muted">
                {pendingRequests} request{pendingRequests !== 1 ? 's' : ''} pending — waiting for a mentor to respond.
              </p>
            ) : (
              <div>
                <p className="text-[13px] muted mb-3">You don't have a mentor yet.</p>
                <Link to="/mentorship"
                  className="inline-flex items-center justify-center h-9 px-4 rounded-xl text-[12.5px] font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'var(--primary)' }}>
                  Find a mentor
                </Link>
              </div>
            )}
          </div>

          {/* Upcoming challenges */}
          <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
            <div className="px-5 py-4 hairline-b flex items-center justify-between">
              <h2 className="text-[16px] font-semibold">Upcoming challenges</h2>
              <Link to="/challenges" className="text-[12.5px] font-medium hover:underline" style={{ color: 'var(--primary)' }}>View all</Link>
            </div>
            {loadingChallenges ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
              </div>
            ) : upcomingChallenges.length === 0 ? (
              <div className="px-5 py-10 text-center text-[13px] muted">No open challenges right now.</div>
            ) : (
              <div className="divide-y divide-[var(--hair)]">
                {upcomingChallenges.map(c => (
                  <Link key={c.id} to={`/challenges/${c.id}`}
                    className="block px-5 py-4 hover:bg-[var(--hair-2)] transition-colors">
                    <div className="text-[13.5px] font-medium truncate mb-1.5">{c.title}</div>
                    <div className="flex items-center justify-between">
                      <DifficultyBadge level={c.difficulty_level} />
                      <span className="text-[11.5px] font-mono muted">Due {fmtDate(c.deadline)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity timeline */}
      <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 hairline-b">
          <h2 className="text-[16px] font-semibold">Activity timeline</h2>
        </div>
        {loadingActivity ? (
          <div className="divide-y divide-[var(--hair)]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-3.5">
                <Skeleton className="w-8 h-8 rounded-xl" />
                <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-1/2" /><Skeleton className="h-3 w-1/3" /></div>
              </div>
            ))}
          </div>
        ) : activity.length === 0 ? (
          <div className="px-6 py-10 text-center text-[13px] muted">
            No activity yet — enroll in a module or submit a project to get started.
          </div>
        ) : (
          <div className="divide-y divide-[var(--hair)]">
            {activity.map(log => (
              <div key={log.id} className="flex items-center gap-3 px-6 py-3">
                <div className="w-8 h-8 rounded-xl grid place-items-center text-lg shrink-0"
                  style={{ background: 'var(--hair-2)' }}>
                  {ACTION_ICONS[log.action] ?? '📋'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium truncate">{log.description}</div>
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
