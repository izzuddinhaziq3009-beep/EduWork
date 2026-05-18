import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useActiveChallenges, useStudentChallengeSubmissions, useStudentSubmissionsWithContext } from '@/hooks/useChallenges'
import { ChallengeCard, ChallengeCardSkeleton } from '@/components/features/challenges/ChallengeCard'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { fmtRelative } from '@/utils/formatters'
import type { DifficultyLevel, ChallengeSubmissionStatus } from '@/types'

const DIFFICULTIES: { label: string; value: DifficultyLevel | 'all' }[] = [
  { label: 'All',          value: 'all'          },
  { label: 'Beginner',     value: 'beginner'     },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced',     value: 'advanced'     },
]

const SUB_STATUS: Record<ChallengeSubmissionStatus, { label: string; bg: string; color: string }> = {
  submitted:      { label: 'Submitted',    bg: 'var(--primary-soft)', color: 'var(--primary)' },
  reviewing:      { label: 'Under review', bg: 'var(--warn-soft)',    color: 'var(--warn)'    },
  feedback_given: { label: 'Reviewed',     bg: 'var(--accent-soft)',  color: 'var(--accent)'  },
  completed:      { label: 'Completed',    bg: 'var(--accent-soft)',  color: 'var(--accent)'  },
}

const COLORS = ['#1E5BFF', '#0F4C5C', '#2C9D6E', '#C97A2D', '#B8456A']
function companyColor(name: string) { return COLORS[name.charCodeAt(0) % COLORS.length] }

export function ChallengesPage() {
  const { user } = useAuthStore()
  const [tab,    setTab  ] = useState<'browse' | 'mine'>('browse')
  const [search, setSearch] = useState('')
  const [diff,   setDiff  ] = useState<DifficultyLevel | 'all'>('all')

  const { data: challenges = [],  isLoading: loadingChallenges } = useActiveChallenges()
  const { data: submissions = [] }                               = useStudentChallengeSubmissions(user?.id ?? '')
  const { data: mySubmissions = [], isLoading: loadingMine }    = useStudentSubmissionsWithContext(user?.id ?? '')

  const submittedIds = useMemo(() => new Set(submissions.map(s => s.challenge_id)), [submissions])

  const filtered = useMemo(() => challenges.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.company.full_name.toLowerCase().includes(search.toLowerCase())
    const matchDiff   = diff === 'all' || c.difficulty_level === diff
    return matchSearch && matchDiff
  }), [challenges, search, diff])

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <PageHeader
        label="Real-world work"
        title="Industry Challenges"
        description="Solve real problems posted by companies and build your professional portfolio."
      />

      {/* Tab switcher */}
      <div className="hairline rounded-xl p-1 flex bg-[#FBFAF5] w-fit mb-6">
        {(['browse', 'mine'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors ${tab === t ? 'bg-white shadow-card ink' : 'muted hover:text-[color:var(--ink)]'}`}>
            {t === 'browse' ? 'Browse' : `My Submissions${mySubmissions.length > 0 ? ` (${mySubmissions.length})` : ''}`}
          </button>
        ))}
      </div>

      {tab === 'browse' ? (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Input
              placeholder="Search challenges or companies…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-[320px] h-10"
            />
            <div className="hairline rounded-xl p-1 flex bg-[#FBFAF5] w-fit">
              {DIFFICULTIES.map(d => (
                <button key={d.value} onClick={() => setDiff(d.value)}
                  className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors ${diff === d.value ? 'bg-white shadow-card ink' : 'muted hover:text-[color:var(--ink)]'}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {loadingChallenges ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <ChallengeCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4"/><path d="M5 5h12l-2 4 2 4H5"/></svg>}
              title={search || diff !== 'all' ? 'No challenges match your filters' : 'No active challenges right now'}
              description={search || diff !== 'all' ? 'Try adjusting your search or difficulty filter.' : 'Check back soon — companies are posting new challenges regularly.'}
            />
          ) : (
            <>
              {submittedIds.size > 0 && (
                <div className="mb-4 text-[13px] muted">
                  You've submitted to <strong>{submittedIds.size}</strong> of {challenges.length} challenge{challenges.length !== 1 ? 's' : ''}.
                </div>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(c => (
                  <ChallengeCard key={c.id} challenge={c} hasSubmission={submittedIds.has(c.id)} />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        /* My Submissions tab */
        loadingMine ? (
          <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-[var(--hair)]">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : mySubmissions.length === 0 ? (
          <EmptyState
            icon={<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13l3-8h12l3 8"/><path d="M3 13h5l1 3h6l1-3h5v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z"/></svg>}
            title="No submissions yet"
            description="Browse challenges and submit your GitHub repository to get started."
          />
        ) : (
          <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="hairline-b">
                  {['Challenge', 'Company', 'Difficulty', 'Submitted', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11.5px] font-mono tracking-wide muted uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--hair)]">
                {mySubmissions.map(({ submission, challenge, company }) => {
                  const st = SUB_STATUS[submission.status]
                  const hasReview = submission.status === 'feedback_given' || submission.status === 'completed'
                  return (
                    <tr key={submission.id} className="hover:bg-[var(--hair-2)] transition-colors">
                      <td className="px-5 py-3.5 max-w-[220px]">
                        <div className="text-[13.5px] font-medium truncate">{challenge.title}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md grid place-items-center font-mono font-bold text-white text-[10px] shrink-0"
                            style={{ background: companyColor(company.full_name) }}>
                            {company.full_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[13px] ink-2 truncate max-w-[120px]">{company.full_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <DifficultyBadge level={challenge.difficulty_level} />
                      </td>
                      <td className="px-5 py-3.5 text-[12px] font-mono muted whitespace-nowrap">
                        {fmtRelative(submission.submitted_at)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="tag" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                          {hasReview && (
                            <span title="Feedback received">
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                              </svg>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link to={`/challenges/${challenge.id}`}
                          className="h-8 px-3 rounded-lg text-[12.5px] font-semibold hairline hover:bg-[var(--hair-2)] inline-flex items-center transition-colors"
                          style={{ color: 'var(--primary)' }}>
                          View →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}
