import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import {
  useStudentIndependentProjects,
  useAvailableIndependentProjects,
  useCreateIndependentProject,
  useSubmitIndependentProject,
} from '@/hooks/useIndependentProjects'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { fmtRelative } from '@/utils/formatters'
import type { IndependentProject, IndependentProjectStatus } from '@/types'

const STATUS_CONFIG: Record<IndependentProjectStatus, { label: string; bg: string; color: string }> = {
  in_progress: { label: 'In Progress', bg: 'var(--warn-soft)',    color: 'var(--warn)'    },
  submitted:   { label: 'Submitted',   bg: 'var(--primary-soft)', color: 'var(--primary)' },
  completed:   { label: 'Completed',   bg: 'var(--accent-soft)',  color: 'var(--accent)'  },
}

const createSchema = z.object({
  title:       z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
})

const submitSchema = z.object({
  github_url: z.string().url('Enter a valid GitHub URL.').optional().or(z.literal('')),
})

export function IndependentProjectsPage() {
  const { user } = useAuthStore()
  const [showCreate, setShowCreate] = useState(false)
  const [submitting, setSubmitting] = useState<IndependentProject | null>(null)

  const { data: myProjects = [],    isLoading: loadingMine }   = useStudentIndependentProjects(user?.id ?? '')
  const { data: showcase = [],      isLoading: loadingPublic } = useAvailableIndependentProjects()
  const create    = useCreateIndependentProject()
  const submitPrj = useSubmitIndependentProject()

  const createForm = useForm<z.infer<typeof createSchema>>({ resolver: zodResolver(createSchema) })
  const submitForm = useForm<z.infer<typeof submitSchema>>({ resolver: zodResolver(submitSchema) })

  const handleCreate = (vals: z.infer<typeof createSchema>) => {
    if (!user) return
    create.mutate({ studentId: user.id, ...vals }, {
      onSuccess: () => { setShowCreate(false); createForm.reset() },
    })
  }

  const handleSubmit = (vals: z.infer<typeof submitSchema>) => {
    if (!user || !submitting) return
    submitPrj.mutate({ projectId: submitting.id, githubUrl: vals.github_url || undefined, studentId: user.id }, {
      onSuccess: () => { setSubmitting(null); submitForm.reset() },
    })
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1100px]">
      <PageHeader
        label="Self-directed work"
        title="Independent Projects"
        description="Create and manage your own projects to showcase initiative and depth."
        action={
          <Button onClick={() => setShowCreate(true)} style={{ background: 'var(--primary)', color: '#fff' }}>
            + New project
          </Button>
        }
      />

      <Tabs defaultValue="mine">
        <TabsList className="mb-6">
          <TabsTrigger value="mine">My Projects ({myProjects.length})</TabsTrigger>
          <TabsTrigger value="showcase">Showcase</TabsTrigger>
        </TabsList>

        {/* My projects */}
        <TabsContent value="mine">
          {loadingMine ? (
            <div className="grid sm:grid-cols-2 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-surface hairline rounded-2xl p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" /><Skeleton className="h-3 w-full" /><Skeleton className="h-9 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : myProjects.length === 0 ? (
            <EmptyState
              icon={<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/></svg>}
              title="No projects yet"
              description="Start your first independent project to demonstrate initiative."
              action={<Button onClick={() => setShowCreate(true)} style={{ background: 'var(--primary)', color: '#fff' }}>Create project</Button>}
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {myProjects.map(p => <ProjectCard key={p.id} project={p} onSubmit={() => setSubmitting(p)} />)}
            </div>
          )}
        </TabsContent>

        {/* Showcase */}
        <TabsContent value="showcase">
          {loadingPublic ? (
            <div className="grid sm:grid-cols-2 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-surface hairline rounded-2xl p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" /><Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : showcase.length === 0 ? (
            <EmptyState title="No completed projects yet" description="Be the first to complete an independent project!" />
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {showcase.map(p => <ProjectCard key={p.id} project={p} readonly />)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New independent project</DialogTitle></DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
              <FormField control={createForm.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Project title</FormLabel><FormControl><Input {...field} placeholder="e.g. Personal finance dashboard" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={createForm.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={4} placeholder="What will you build and why?" /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" disabled={create.isPending} className="w-full" style={{ background: 'var(--primary)', color: '#fff' }}>
                {create.isPending ? 'Creating…' : 'Create project'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Submit dialog */}
      <Dialog open={!!submitting} onOpenChange={open => !open && setSubmitting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Submit project</DialogTitle></DialogHeader>
          <Form {...submitForm}>
            <form onSubmit={submitForm.handleSubmit(handleSubmit)} className="space-y-4">
              <p className="text-[14px] ink-2">Submitting <strong>{submitting?.title}</strong>. Add your GitHub URL if applicable.</p>
              <FormField control={submitForm.control} name="github_url" render={({ field }) => (
                <FormItem><FormLabel>GitHub URL <span className="muted font-normal">(optional)</span></FormLabel>
                  <FormControl><Input {...field} placeholder="https://github.com/yourname/repo" /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" disabled={submitPrj.isPending} className="w-full" style={{ background: 'var(--primary)', color: '#fff' }}>
                {submitPrj.isPending ? 'Submitting…' : 'Submit project'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ProjectCard({ project, onSubmit, readonly }: { project: IndependentProject; onSubmit?: () => void; readonly?: boolean }) {
  const { label, bg, color } = STATUS_CONFIG[project.status]
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-semibold leading-snug">{project.title}</h3>
        <span className="tag shrink-0" style={{ background: bg, color }}>{label}</span>
      </div>
      <p className="text-[13px] muted leading-relaxed line-clamp-3">{project.description}</p>
      <div className="text-[11.5px] font-mono muted">{fmtRelative(project.created_at)}</div>
      {project.github_url && (
        <a href={project.github_url} target="_blank" rel="noopener noreferrer"
          className="text-[12.5px] font-medium flex items-center gap-1.5 hover:underline" style={{ color: 'var(--primary)' }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.14-1.1-1.44-1.1-1.44-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.9.83.1-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.9-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>
          View on GitHub
        </a>
      )}
      {!readonly && project.status === 'in_progress' && onSubmit && (
        <button onClick={onSubmit}
          className="h-9 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--primary)' }}>
          Submit project
        </button>
      )}
    </div>
  )
}
