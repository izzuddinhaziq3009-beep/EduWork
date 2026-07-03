import { useAvailableIndependentProjects } from '@/hooks/useIndependentProjects'
import { IndependentProjectCard } from '@/components/features/projects/IndependentProjectCard'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'

export function CompanyShowcase() {
  const { data: projects = [], isLoading } = useAvailableIndependentProjects()

  return (
    <div data-tour="showcase" className="p-6 lg:p-8 max-w-[1200px]">
      <PageHeader
        label="Talent discovery"
        title="Student Showcase"
        description="Browse completed independent projects from students and reach out to those whose work interests you."
      />

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface hairline rounded-2xl overflow-hidden shadow-card">
              <Skeleton className="h-[140px] w-full rounded-none" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/>
            </svg>
          }
          title="No projects yet"
          description="Students will appear here once they complete and publish their independent projects."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(p => (
            <IndependentProjectCard
              key={p.id}
              project={p}
              readonly
              messageHref={`/company/messages?with=${p.student_id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
