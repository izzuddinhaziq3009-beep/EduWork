import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useProjects, useStudentSubmissions } from '@/hooks/useProjects'
import {
  useStudentIndependentProjects,
  useAvailableIndependentProjects,
  useCreateIndependentProject,
  useSubmitIndependentProject,
  useCompleteIndependentProject,
  useUpdateIndependentProject,
  useDeleteIndependentProject,
  useUploadIndependentProjectImage,
} from '@/hooks/useIndependentProjects'
import { ProjectCard, ProjectCardSkeleton } from '@/components/features/projects/ProjectCard'
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
import type { IndependentProject } from '@/types'
import { IndependentProjectCard } from '@/components/features/projects/IndependentProjectCard'

const createSchema = z.object({
  title:       z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
})

const submitSchema = z.object({
  github_url: z.string().url('Enter a valid GitHub URL.').optional().or(z.literal('')),
})

const editSchema = z.object({
  title:       z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  github_url:  z.string().url('Enter a valid GitHub URL.').optional().or(z.literal('')),
})

// ── Guided Projects tab (existing Projects content, untouched) ─────────────────

function GuidedTab() {
  const { user } = useAuthStore()
  const { data: projects = [],    isLoading: loadingProjects } = useProjects()
  const { data: submissions = [], isLoading: loadingSubs }     = useStudentSubmissions(user?.id ?? '')

  const submissionMap = useMemo(() =>
    Object.fromEntries(submissions.map(s => [s.project_id, s])),
  [submissions])

  const available = projects.filter(p => !submissionMap[p.id])
  const submitted = projects.filter(p =>  submissionMap[p.id])
  const loading   = loadingProjects || loadingSubs

  return (
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
  )
}

// ── Independent Projects tab (existing IndependentProjectsPage content) ────────

function IndependentTab() {
  const { user } = useAuthStore()
  const [showCreate,     setShowCreate]     = useState(false)
  const [createImageUrl, setCreateImageUrl] = useState<string | null>(null)
  const [editImageUrl,   setEditImageUrl]   = useState<string | null>(null)
  const [submitting,     setSubmitting]     = useState<IndependentProject | null>(null)
  const [editing,        setEditing]        = useState<IndependentProject | null>(null)
  const [deleting,       setDeleting]       = useState<IndependentProject | null>(null)

  const { data: myProjects = [], isLoading: loadingMine }   = useStudentIndependentProjects(user?.id ?? '')
  const { data: showcase   = [], isLoading: loadingPublic } = useAvailableIndependentProjects()
  const create      = useCreateIndependentProject()
  const submitPrj   = useSubmitIndependentProject()
  const completePrj = useCompleteIndependentProject()
  const updatePrj   = useUpdateIndependentProject()
  const deletePrj   = useDeleteIndependentProject()
  const uploadImg   = useUploadIndependentProjectImage()

  const createForm = useForm<z.infer<typeof createSchema>>({ resolver: zodResolver(createSchema) })
  const submitForm = useForm<z.infer<typeof submitSchema>>({ resolver: zodResolver(submitSchema) })
  const editForm   = useForm<z.infer<typeof editSchema>>  ({ resolver: zodResolver(editSchema)   })

  useEffect(() => {
    if (editing) {
      editForm.reset({
        title:       editing.title,
        description: editing.description,
        github_url:  editing.github_url ?? '',
      })
      setEditImageUrl(editing.image_url ?? null)
    } else {
      setEditImageUrl(null)
    }
  }, [editing])

  const handleCreate = (vals: z.infer<typeof createSchema>) => {
    if (!user) return
    create.mutate({ studentId: user.id, ...vals, image_url: createImageUrl }, {
      onSuccess: () => { setShowCreate(false); createForm.reset(); setCreateImageUrl(null) },
    })
  }

  const handleSubmit = (vals: z.infer<typeof submitSchema>) => {
    if (!user || !submitting) return
    submitPrj.mutate(
      { projectId: submitting.id, githubUrl: vals.github_url || undefined, studentId: user.id },
      { onSuccess: () => { setSubmitting(null); submitForm.reset() } },
    )
  }

  const handleEdit = (vals: z.infer<typeof editSchema>) => {
    if (!user || !editing) return
    updatePrj.mutate(
      { projectId: editing.id, studentId: user.id, title: vals.title, description: vals.description, github_url: vals.github_url || null, image_url: editImageUrl },
      { onSuccess: () => setEditing(null) },
    )
  }

  const handleDelete = () => {
    if (!user || !deleting) return
    deletePrj.mutate(
      { projectId: deleting.id, studentId: user.id },
      { onSuccess: () => setDeleting(null) },
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[13.5px] muted">Create and manage your own projects to showcase initiative and depth.</p>
        <Button onClick={() => setShowCreate(true)} style={{ background: 'var(--primary)', color: '#fff' }}>
          + New project
        </Button>
      </div>

      <Tabs defaultValue="mine">
        <TabsList className="mb-6">
          <TabsTrigger value="mine">My Projects ({myProjects.length})</TabsTrigger>
          <TabsTrigger value="showcase">Showcase</TabsTrigger>
        </TabsList>

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
              {myProjects.map(p => (
                <IndependentProjectCard
                  key={p.id}
                  project={p}
                  onSubmit={() => setSubmitting(p)}
                  onComplete={() => completePrj.mutate({ projectId: p.id, studentId: user!.id })}
                  onEdit={() => setEditing(p)}
                  onDelete={() => setDeleting(p)}
                />
              ))}
            </div>
          )}
        </TabsContent>

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
              {showcase.map(p => <IndependentProjectCard key={p.id} project={p} readonly />)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showCreate} onOpenChange={open => { setShowCreate(open); if (!open) setCreateImageUrl(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New independent project</DialogTitle></DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
              <FormField control={createForm.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Project title</FormLabel><FormControl><Input {...field} placeholder="e.g. Personal finance dashboard" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={createForm.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={3} placeholder="What will you build and why?" /></FormControl><FormMessage /></FormItem>
              )} />
              {/* Cover image upload */}
              <div className="space-y-2">
                <label className="text-[12.5px] font-medium ink-2 block">Cover image <span className="muted font-normal">(optional)</span></label>
                <div className="hairline rounded-xl overflow-hidden" style={{ background: 'var(--hair-2)' }}>
                  {createImageUrl ? (
                    <div className="relative">
                      <img src={createImageUrl} alt="Cover preview" className="w-full h-[120px] object-cover" />
                      <button type="button" onClick={() => setCreateImageUrl(null)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg grid place-items-center bg-black/50 text-white hover:bg-black/70 transition-colors">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                      </button>
                    </div>
                  ) : (
                    <div className="h-[80px] flex items-center justify-center gap-2" style={{ color: 'var(--muted)' }}>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                      <span className="text-[12px]">No image</span>
                    </div>
                  )}
                </div>
                <label className="h-8 px-3 rounded-lg hairline text-[12px] font-semibold hover:bg-[var(--hair-2)] cursor-pointer transition-colors inline-flex items-center gap-1.5">
                  {uploadImg.isPending ? 'Uploading…' : createImageUrl ? 'Replace' : 'Upload image'}
                  <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" disabled={uploadImg.isPending}
                    onChange={e => { const f = e.target.files?.[0]; if (f && user) uploadImg.mutate({ studentId: user.id, file: f }, { onSuccess: url => setCreateImageUrl(url) }) }} />
                </label>
                <span className="text-[11px] muted ml-2">JPG, PNG, WEBP · max 5 MB</span>
              </div>
              <Button type="submit" disabled={create.isPending || uploadImg.isPending} className="w-full" style={{ background: 'var(--primary)', color: '#fff' }}>
                {create.isPending ? 'Creating…' : 'Create project'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!submitting} onOpenChange={open => !open && setSubmitting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Submit project</DialogTitle></DialogHeader>
          <Form {...submitForm}>
            <form onSubmit={submitForm.handleSubmit(handleSubmit)} className="space-y-4">
              <p className="text-[14px] ink-2">Submitting <strong>{submitting?.title}</strong>. Add your GitHub URL if applicable.</p>
              <FormField control={submitForm.control} name="github_url" render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub URL <span className="muted font-normal">(optional)</span></FormLabel>
                  <FormControl><Input {...field} placeholder="https://github.com/yourname/repo" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={submitPrj.isPending} className="w-full" style={{ background: 'var(--primary)', color: '#fff' }}>
                {submitPrj.isPending ? 'Submitting…' : 'Submit project'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit dialog — pre-filled via useEffect, available for all statuses */}
      <Dialog open={!!editing} onOpenChange={open => !open && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit project</DialogTitle></DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
              <FormField control={editForm.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Project title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={editForm.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={editForm.control} name="github_url" render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub URL <span className="muted font-normal">(optional)</span></FormLabel>
                  <FormControl><Input {...field} placeholder="https://github.com/yourname/repo" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              {/* Cover image upload */}
              <div className="space-y-2">
                <label className="text-[12.5px] font-medium ink-2 block">Cover image <span className="muted font-normal">(optional)</span></label>
                <div className="hairline rounded-xl overflow-hidden" style={{ background: 'var(--hair-2)' }}>
                  {editImageUrl ? (
                    <div className="relative">
                      <img src={editImageUrl} alt="Cover preview" className="w-full h-[120px] object-cover" />
                      <button type="button" onClick={() => setEditImageUrl(null)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg grid place-items-center bg-black/50 text-white hover:bg-black/70 transition-colors">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                      </button>
                    </div>
                  ) : (
                    <div className="h-[80px] flex items-center justify-center gap-2" style={{ color: 'var(--muted)' }}>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                      <span className="text-[12px]">No image</span>
                    </div>
                  )}
                </div>
                <label className="h-8 px-3 rounded-lg hairline text-[12px] font-semibold hover:bg-[var(--hair-2)] cursor-pointer transition-colors inline-flex items-center gap-1.5">
                  {uploadImg.isPending ? 'Uploading…' : editImageUrl ? 'Replace' : 'Upload image'}
                  <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" disabled={uploadImg.isPending}
                    onChange={e => { const f = e.target.files?.[0]; if (f && user) uploadImg.mutate({ studentId: user.id, file: f }, { onSuccess: url => setEditImageUrl(url) }) }} />
                </label>
                <span className="text-[11px] muted ml-2">JPG, PNG, WEBP · max 5 MB</span>
              </div>
              <Button type="submit" disabled={updatePrj.isPending || uploadImg.isPending} className="w-full" style={{ background: 'var(--primary)', color: '#fff' }}>
                {updatePrj.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleting} onOpenChange={open => !open && setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete project</DialogTitle></DialogHeader>
          <p className="text-[14px]">
            Delete <strong>{deleting?.title}</strong>? This cannot be undone. If the project was in the Showcase it will be removed too.
          </p>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" onClick={() => setDeleting(null)} className="flex-1" disabled={deletePrj.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deletePrj.isPending}
              className="flex-1"
              style={{ background: 'var(--rose)', color: '#fff' }}
            >
              {deletePrj.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const primaryTab = searchParams.get('tab') === 'independent' ? 'independent' : 'guided'

  return (
    <div className="p-6 lg:p-8 max-w-[1200px]">
      <PageHeader
        label="Your work"
        title="Projects"
        description="Guided module work for mentor review, and your own independent projects."
      />

      {/* Primary segmented control — pill style, visually distinct from inner Radix tabs */}
      <div
        className="inline-flex p-1 rounded-xl gap-1 mb-8"
        style={{ background: 'var(--hair-2)', border: '1px solid var(--hair)' }}
      >
        {(['guided', 'independent'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSearchParams(
              tab === 'guided' ? {} : { tab: 'independent' },
              { replace: true },
            )}
            className="px-5 py-2 rounded-[10px] text-[13.5px] font-semibold transition-all"
            style={primaryTab === tab ? {
              background: 'var(--primary)',
              color:      '#fff',
              boxShadow:  '0 1px 4px rgba(79,70,229,0.25)',
            } : {
              color: 'var(--ink-2)',
            }}
          >
            {tab === 'guided' ? 'Guided Projects' : 'Independent Projects'}
          </button>
        ))}
      </div>

      {primaryTab === 'guided' ? <GuidedTab /> : <IndependentTab />}
    </div>
  )
}
