import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useAllCompanySubmissions, useCompanyChallenges } from '@/hooks/useCompany'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { fmtDate, fmtRelative, fmtInitials } from '@/utils/formatters'
import type { ChallengeSubmissionStatus } from '@/types'

const COLORS = ['#1E5BFF', '#0F4C5C', '#2C9D6E', '#C97A2D', '#B8456A']
function avatarColor(name: string) { return COLORS[name.charCodeAt(0) % COLORS.length] }

const STATUS_STYLE: Record<ChallengeSubmissionStatus, { label: string; bg: string; color: string }> = {
  submitted:      { label: 'New',          bg: 'var(--warn-soft)',    color: 'var(--warn)'    },
  reviewing:      { label: 'Reviewing',    bg: 'var(--primary-soft)', color: 'var(--primary)' },
  feedback_given: { label: 'Reviewed',     bg: 'var(--accent-soft)',  color: 'var(--accent)'  },
  completed:      { label: 'Completed',    bg: 'var(--accent-soft)',  color: 'var(--accent)'  },
}

export function CompanySubmissions() {
  const { user }          = useAuthStore()
  const [params]          = useSearchParams()
  const [filter, setFilter] = useState(params.get('challenge') ?? 'all')

  const { data: submissions = [], isLoading: loadingSubs }   = useAllCompanySubmissions(user?.id ?? '')
  const { data: challenges  = [], isLoading: loadingChallenges } = useCompanyChallenges(user?.id ?? '')

  const filtered = filter === 'all' ? submissions : submissions.filter(s => s.challenge.id === filter)

  return (
    <div className="p-6 lg:p-8 max-w-[1200px]">
      <PageHeader
        label="Review queue"
        title="Submissions"
        description="Review student submissions across all your challenges."
      />

      {/* Challenge filter */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-[13px] ink-2">Filter by challenge:</span>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="hairline rounded-xl px-3 py-2 text-[13px] bg-surface ink-2 outline-none focus:border-[color:var(--primary)]">
          <option value="all">All challenges</option>
          {challenges.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {loadingSubs || loadingChallenges ? (
        <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-[var(--hair)]">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13l3-8h12l3 8"/><path d="M3 13h5l1 3h6l1-3h5v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z"/></svg>}
          title="No submissions yet"
          description={filter === 'all' ? 'Students will appear here once they submit to your challenges.' : 'No submissions for this challenge yet.'}
        />
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden lg:block bg-surface hairline rounded-2xl shadow-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="hairline-b">
                  {['Student', 'Challenge', 'GitHub', 'Commits', 'Submitted', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11.5px] font-mono tracking-wide muted uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--hair)]">
                {filtered.map(({ submission, challenge, student }) => {
                  const st = STATUS_STYLE[submission.status]
                  return (
                    <tr key={submission.id} className="hover:bg-[var(--hair-2)] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg grid place-items-center font-mono font-semibold text-white text-[11px] shrink-0"
                            style={{ background: avatarColor(student.full_name) }}>
                            {fmtInitials(student.full_name)}
                          </div>
                          <span className="text-[13.5px] font-medium">{student.full_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] ink-2 max-w-[200px] truncate">{challenge.title}</td>
                      <td className="px-5 py-3.5">
                        <a href={submission.github_url} target="_blank" rel="noopener noreferrer"
                          className="text-[12.5px] font-mono hover:underline truncate block max-w-[160px]"
                          style={{ color: 'var(--primary)' }}>
                          {submission.github_repo_name}
                        </a>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] font-mono muted">{submission.github_commit_count}</td>
                      <td className="px-5 py-3.5 text-[12px] font-mono muted whitespace-nowrap">{fmtRelative(submission.submitted_at)}</td>
                      <td className="px-5 py-3.5">
                        <span className="tag" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/company/messages?with=${student.id}`}
                            className="h-8 px-3 rounded-lg text-[12.5px] font-semibold hairline hover:bg-[var(--hair-2)] inline-flex items-center gap-1.5 transition-colors"
                            style={{ color: 'var(--ink-2)' }}
                            title={`Message ${student.full_name}`}>
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a7 7 0 0 1-10.6 6l-4.4 1 1.1-4A7 7 0 1 1 21 12z"/></svg>
                            Message
                          </Link>
                          <Link to={`/company/submissions/${submission.id}`}
                            className="h-8 px-3 rounded-lg text-[12.5px] font-semibold hairline hover:bg-[var(--hair-2)] inline-flex items-center transition-colors"
                            style={{ color: 'var(--primary)' }}>
                            Review →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile/tablet: cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map(({ submission, challenge, student }) => {
              const st = STATUS_STYLE[submission.status]
              return (
                <div key={submission.id} className="bg-surface hairline rounded-2xl shadow-card p-4">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-lg grid place-items-center font-mono font-semibold text-white text-[12px] shrink-0"
                      style={{ background: avatarColor(student.full_name) }}>
                      {fmtInitials(student.full_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-medium truncate">{student.full_name}</div>
                      <div className="text-[12px] muted truncate">{challenge.title}</div>
                    </div>
                    <span className="tag shrink-0" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px] mb-3">
                    <a href={submission.github_url} target="_blank" rel="noopener noreferrer"
                      className="font-mono hover:underline truncate" style={{ color: 'var(--primary)' }}>
                      {submission.github_repo_name}
                    </a>
                    <span className="font-mono muted shrink-0 ml-2">{submission.github_commit_count} commits</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11.5px] font-mono muted">{fmtRelative(submission.submitted_at)}</span>
                    <div className="flex items-center gap-2">
                      <Link to={`/company/messages?with=${student.id}`}
                        className="h-8 px-3 rounded-lg text-[12.5px] font-semibold hairline hover:bg-[var(--hair-2)] inline-flex items-center gap-1.5 transition-colors"
                        style={{ color: 'var(--ink-2)' }}>
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a7 7 0 0 1-10.6 6l-4.4 1 1.1-4A7 7 0 1 1 21 12z"/></svg>
                        Message
                      </Link>
                      <Link to={`/company/submissions/${submission.id}`}
                        className="h-8 px-3 rounded-lg text-[12.5px] font-semibold hairline hover:bg-[var(--hair-2)] inline-flex items-center transition-colors"
                        style={{ color: 'var(--primary)' }}>
                        Review →
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
