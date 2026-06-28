import { useState } from 'react'
import { useActivityLogs, useLearningActivityLogs, useProjectActivityLogs, useChallengeActivityLogs } from '@/hooks/useAdmin'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fmtDateTime } from '@/utils/formatters'
import type { ActivityLog } from '@/types'

const ACTION_ICONS: Record<string, string> = {
  module_enrolled:    '📚', module_completed:   '✅',
  project_submitted:  '📁', feedback_given:     '💬',
  mentorship_request: '🤝', mentorship_accepted:'🎓',
  challenge_submitted:'🏆', challenge_approved: '⭐',
  challenge_feedback: '⭐', user_signup:        '👤',
}

function LogRow({ log }: { log: ActivityLog }) {
  return (
    <tr className="hover:bg-[var(--hair-2)] transition-colors">
      <td className="px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{ACTION_ICONS[log.action] ?? '📋'}</span>
          <span className="text-[12.5px] font-mono muted">{log.action}</span>
        </div>
      </td>
      <td className="px-5 py-3 text-[13.5px] ink-2 max-w-[400px] truncate">{log.description}</td>
      <td className="px-5 py-3 text-[12px] font-mono muted whitespace-nowrap">{fmtDateTime(log.created_at)}</td>
    </tr>
  )
}

function LogTable({ logs, isLoading }: { logs: ActivityLog[]; isLoading: boolean }) {
  if (isLoading) return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--hair)]">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="flex-1 space-y-2"><Skeleton className="h-3.5 w-1/3" /><Skeleton className="h-3 w-1/2" /></div>
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  )

  if (logs.length === 0) return (
    <EmptyState
      icon={<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l2-7 4 14 2-7h6"/></svg>}
      title="No activity recorded"
      description="Actions on the platform will appear here."
    />
  )

  return (
    <>
      {/* Desktop: table */}
      <div className="hidden lg:block bg-surface hairline rounded-2xl shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="hairline-b">
              <th className="text-left px-5 py-3 text-[11.5px] font-mono tracking-wide muted uppercase">Action</th>
              <th className="text-left px-5 py-3 text-[11.5px] font-mono tracking-wide muted uppercase">Description</th>
              <th className="text-left px-5 py-3 text-[11.5px] font-mono tracking-wide muted uppercase">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--hair)]">
            {logs.map(log => <LogRow key={log.id} log={log} />)}
          </tbody>
        </table>
      </div>

      {/* Mobile: compact cards */}
      <div className="lg:hidden space-y-2">
        {logs.map(log => (
          <div key={log.id} className="bg-surface hairline rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-lg shrink-0">{ACTION_ICONS[log.action] ?? '📋'}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] ink-2 leading-snug">{log.description}</div>
              <div className="text-[11px] font-mono muted mt-1">{log.action} · {fmtDateTime(log.created_at)}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function AllActivityTab() {
  const [search, setSearch] = useState('')
  const [page,   setPage  ] = useState(0)

  const { data, isLoading } = useActivityLogs(page, search)
  const perPage = 20
  const total = data?.total ?? 0
  const maxPage = Math.ceil(total / perPage) - 1

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search activity descriptions…"
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(0) }}
        className="max-w-[320px]"
      />
      <LogTable logs={data?.data ?? []} isLoading={isLoading} />
      {total > perPage && (
        <div className="flex items-center gap-3 justify-center">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
            className="h-8 px-3 rounded-lg hairline text-[12.5px] font-semibold disabled:opacity-40 hover:bg-[var(--hair-2)]">← Prev</button>
          <span className="text-[12.5px] font-mono muted">Page {page + 1} of {maxPage + 1}</span>
          <button disabled={page >= maxPage} onClick={() => setPage(p => p + 1)}
            className="h-8 px-3 rounded-lg hairline text-[12.5px] font-semibold disabled:opacity-40 hover:bg-[var(--hair-2)]">Next →</button>
        </div>
      )}
    </div>
  )
}

export function SystemMonitoring() {
  const { data: learning   = [], isLoading: l1 } = useLearningActivityLogs()
  const { data: projects   = [], isLoading: l2 } = useProjectActivityLogs()
  const { data: challenges = [], isLoading: l3 } = useChallengeActivityLogs()

  return (
    <div className="p-6 lg:p-8 max-w-[1100px]">
      <PageHeader label="Admin" title="System Monitoring" description="Track all activity across the platform." />
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Activity</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>
        <TabsContent value="all"><AllActivityTab /></TabsContent>
        <TabsContent value="learning"><LogTable logs={learning}   isLoading={l1} /></TabsContent>
        <TabsContent value="projects"><LogTable logs={projects}   isLoading={l2} /></TabsContent>
        <TabsContent value="challenges"><LogTable logs={challenges} isLoading={l3} /></TabsContent>
      </Tabs>
    </div>
  )
}
