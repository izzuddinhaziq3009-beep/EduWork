import { useState, useMemo } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useModules, useModuleProgress, useEnrollModule } from '@/hooks/useModules'
import { ModuleCard, ModuleCardSkeleton } from '@/components/features/modules/ModuleCard'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Input } from '@/components/ui/input'
import type { DifficultyLevel } from '@/types'

const DIFFICULTIES: { label: string; value: DifficultyLevel | 'all' }[] = [
  { label: 'All',          value: 'all'         },
  { label: 'Beginner',     value: 'beginner'    },
  { label: 'Intermediate', value: 'intermediate'},
  { label: 'Advanced',     value: 'advanced'    },
]

export function ModulesPage() {
  const { user } = useAuthStore()
  const [search, setSearch]   = useState('')
  const [diff,   setDiff]     = useState<DifficultyLevel | 'all'>('all')

  const { data: modules = [],  isLoading: loadingModules }  = useModules()
  const { data: progress = [], isLoading: loadingProgress } = useModuleProgress(user?.id ?? '')
  const enroll = useEnrollModule()

  const progressMap = useMemo(() =>
    Object.fromEntries(progress.map(p => [p.module_id, p])),
  [progress])

  const filtered = useMemo(() => modules.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
                        m.description.toLowerCase().includes(search.toLowerCase())
    const matchDiff   = diff === 'all' || m.difficulty_level === diff
    return matchSearch && matchDiff
  }), [modules, search, diff])

  const loading = loadingModules || loadingProgress

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <PageHeader
        label="Your learning path"
        title="Learning Modules"
        description="Browse, enroll, and track your progress through structured learning modules."
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Search modules…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-[320px]"
        />
        <div className="hairline rounded-xl p-1 flex bg-[var(--hair-2)] w-fit">
          {DIFFICULTIES.map(d => (
            <button key={d.value} onClick={() => setDiff(d.value)}
              className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors ${diff === d.value ? 'bg-[var(--surface)] shadow-card ink' : 'muted hover:text-[color:var(--ink)]'}`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <ModuleCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2V5z"/><path d="M9 7h7M9 11h7"/></svg>}
          title={search || diff !== 'all' ? 'No modules match your filters' : 'No modules yet'}
          description={search || diff !== 'all' ? 'Try adjusting your search or filter.' : 'Check back soon — modules are being added.'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(m => (
            <ModuleCard
              key={m.id}
              module={m}
              progress={progressMap[m.id]}
              onEnroll={() => user && enroll.mutate({ moduleId: m.id, studentId: user.id })}
              enrolling={enroll.isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}
