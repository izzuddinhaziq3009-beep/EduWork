import { useMemo } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useProjects, useStudentSubmissions } from '@/hooks/useProjects'
import { ProjectCard, ProjectCardSkeleton } from '@/components/features/projects/ProjectCard'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function ProjectsPage() {
  const { user } = useAuthStore()
  const { data: projects = [],     isLoading: loadingProjects }  = useProjects()
  const { data: submissions = [],  isLoading: loadingSubs }      = useStudentSubmissions(user?.id ?? '')

  const submissionMap = useMemo(() =>
    Object.fromEntries(submissions.map(s => [s.project_id, s])),
  [submissions])

  const available = projects.filter(p => !submissionMap[p.id])
  const submitted = projects.filter(p => submissionMap[p.id])
  const loading = loadingProjects || loadingSubs

  return (
    <div className="p-6 lg:p-8 max-w-[1200px]">
      <PageHeader
        label="Practical work"
        title="Projects"
        description="Apply what you've learned by submitting projects for mentor review."
      />

      <Tabs defaultValue="available">
        <TabsList className="mb-6">
          <TabsTrigger value="available">Available ({available.length})</TabsTrigger>
          <TabsTrigger value="submitted">My Submissions ({submitted.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
            </div>
          ) : available.length === 0 ? (
            <EmptyState
              icon={<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>}
              title="No projects available"
              description="Check back soon — your instructor will assign projects."
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {available.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="submitted">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
            </div>
          ) : submitted.length === 0 ? (
            <EmptyState
              icon={<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 20h16"/></svg>}
              title="No submissions yet"
              description="Submit a project to get mentor feedback."
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {submitted.map(p => <ProjectCard key={p.id} project={p} submission={submissionMap[p.id]} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
