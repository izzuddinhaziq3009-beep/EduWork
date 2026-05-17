import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useMentorSubmissions } from '@/hooks/useMentor'
import { SubmissionStatus } from '@/components/features/projects/SubmissionStatus'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { fmtDate, fmtRelative, fmtInitials } from '@/utils/formatters'
import type { SubmissionStatus as TStatus } from '@/types'

const FILTERS: { label: string; value: TStatus | 'all' }[] = [
  { label: 'All',               value: 'all'               },
  { label: 'Needs review',      value: 'submitted'         },
  { label: 'Reviewing',         value: 'reviewing'         },
  { label: 'Approved',          value: 'approved'          },
  { label: 'Revision requested', value: 'revision_requested' },
]

const COLORS = ['#0F4C5C', '#2C9D6E', '#C97A2D', '#B8456A', '#3B6AC9']
function avatarColor(name: string) { return COLORS[name.charCodeAt(0) % COLORS.length] }

export function SubmissionsPage() {
  const { user } = useAuthStore()
  const [filter, setFilter] = useState<TStatus | 'all'>('all')

  const { data: submissions = [], isLoading } = useMentorSubmissions(user?.id ?? '')

  const filtered = filter === 'all' ? submissions : submissions.filter(s => s.submission.status === filter)

  return (
    <div className="p-6 lg:p-8 max-w-[1200px]">
      <PageHeader
        label="Review queue"
        title="Student Submissions"
        description="Review project submissions from your mentees and provide feedback."
      />

      {/* Filters */}
      <div className="hairline rounded-xl p-1 flex flex-wrap gap-0.5 bg-[#FBFAF5] w-fit mb-6">
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors ${filter === f.value ? 'bg-white shadow-card ink' : 'muted hover:text-[color:var(--ink)]'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
          <div className="divide-y divide-[var(--hair)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13l3-8h12l3 8"/><path d="M3 13h5l1 3h6l1-3h5v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z"/></svg>}
          title={filter === 'all' ? 'No submissions yet' : `No ${filter.replace('_', ' ')} submissions`}
          description="Students from your accepted mentorship requests will appear here."
        />
      ) : (
        <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="hairline-b">
                <th className="text-left px-6 py-3 text-[11.5px] font-mono tracking-wide muted uppercase">Student</th>
                <th className="text-left px-6 py-3 text-[11.5px] font-mono tracking-wide muted uppercase hidden md:table-cell">Project</th>
                <th className="text-left px-6 py-3 text-[11.5px] font-mono tracking-wide muted uppercase hidden lg:table-cell">Submitted</th>
                <th className="text-left px-6 py-3 text-[11.5px] font-mono tracking-wide muted uppercase">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hair)]">
              {filtered.map(({ submission, project, student }) => (
                <tr key={submission.id} className="hover:bg-[var(--hair-2)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg grid place-items-center font-mono font-semibold text-white text-[12px] shrink-0"
                        style={{ background: avatarColor(student.full_name) }}>
                        {fmtInitials(student.full_name)}
                      </div>
                      <div>
                        <div className="text-[13.5px] font-medium">{student.full_name}</div>
                        <div className="text-[11.5px] muted md:hidden">{project.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="text-[13.5px] font-medium">{project.title}</div>
                    <div className="text-[12px] muted">Due {fmtDate(project.due_date)}</div>
                  </td>
                  <td className="px-6 py-4 text-[12.5px] font-mono muted hidden lg:table-cell">
                    {fmtRelative(submission.submitted_at)}
                  </td>
                  <td className="px-6 py-4">
                    <SubmissionStatus status={submission.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/mentor/submissions/${submission.id}`}
                      className="h-9 px-4 rounded-xl hairline text-[12.5px] font-semibold hover:bg-[var(--hair-2)] inline-flex items-center transition-colors"
                      style={{ color: 'var(--primary)' }}>
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
