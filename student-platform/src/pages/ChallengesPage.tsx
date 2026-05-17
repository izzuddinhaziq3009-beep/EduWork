import { useState, useMemo } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useActiveChallenges, useStudentChallengeSubmissions } from '@/hooks/useChallenges'
import { ChallengeCard, ChallengeCardSkeleton } from '@/components/features/challenges/ChallengeCard'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Input } from '@/components/ui/input'
import type { DifficultyLevel } from '@/types'

const DIFFICULTIES: { label: string; value: DifficultyLevel | 'all' }[] = [
  { label: 'All',          value: 'all'          },
  { label: 'Beginner',     value: 'beginner'     },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced',     value: 'advanced'     },
]

export function ChallengesPage() {
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [diff,   setDiff  ] = useState<DifficultyLevel | 'all'>('all')

  const { data: challenges = [],   isLoading: loadingChallenges } = useActiveChallenges()
  const { data: submissions = [],  isLoading: loadingSubs        } = useStudentChallengeSubmissions(user?.id ?? '')

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
              <ChallengeCard
                key={c.id}
                challenge={c}
                hasSubmission={submittedIds.has(c.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
