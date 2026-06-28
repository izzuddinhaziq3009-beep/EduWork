import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import {
  useAllModulesAdmin,
  useAllProjectsAdmin, useCreateProject, useUpdateProject, useDeleteProject, useToggleProjectActive,
  useAllIndependentProjectsAdmin, useDeleteIndependentProject,
} from '@/hooks/useAdmin'
import { useDeleteModule, useToggleModuleActive } from '@/hooks/useModules'
import { CreateModuleDialog } from './CreateModuleDialog'
import { EditModuleDialog } from './EditModuleDialog'
import { DifficultyBadge } from '@/components/common/DifficultyBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fmtDate, fmtDuration } from '@/utils/formatters'
import type { Project } from '@/types'

// ── Shared ─────────────────────────────────────────────────────────────────

type DialogMode = 'create' | 'edit' | null

function ConfirmDelete({ open, onClose, onConfirm, label, loading }: {
  open: boolean; onClose: () => void; onConfirm: () => void; label: string; loading: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Delete {label}?</DialogTitle></DialogHeader>
        <p className="text-[13.5px] ink-2">This action cannot be undone.</p>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button disabled={loading} onClick={onConfirm} className="flex-1"
            style={{ background: 'var(--rose)', color: '#fff' }}>
            {loading ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Modules tab ─────────────────────────────────────────────────────────────

function ModulesTab() {
  const { data: modules = [], isLoading } = useAllModulesAdmin()
  const deleteModule = useDeleteModule()
  const toggleActive = useToggleModuleActive()

  const [creating,  setCreating ] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [delId,      setDelId   ] = useState<string | null>(null)

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setCreating(true)} style={{ background: 'var(--primary)', color: '#fff' }}>+ Create module</Button>
      </div>
      {isLoading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      : modules.length === 0 ? (
        <EmptyState title="No modules yet" description="Create the first learning module." action={<Button onClick={() => setCreating(true)} style={{ background: 'var(--primary)', color: '#fff' }}>Create module</Button>} />
      ) : (
        <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
          <div className="divide-y divide-[var(--hair)]">
            {modules.map(m => (
              <div key={m.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-[14px] font-semibold truncate">{m.title}</span>
                    <span className="tag" style={{ background: m.module_type === 'structured' ? 'var(--primary-soft)' : 'var(--accent-soft)', color: m.module_type === 'structured' ? 'var(--primary)' : 'var(--accent)' }}>
                      {m.module_type === 'structured' ? 'Structured' : 'Simple'}
                    </span>
                    <DifficultyBadge level={m.difficulty_level} />
                    {!m.is_active && <span className="tag" style={{ background: 'var(--hair-2)', color: 'var(--muted)' }}>Inactive</span>}
                  </div>
                  <div className="text-[12px] font-mono muted">{fmtDuration(m.duration_hours)} duration</div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => setEditingId(m.id)} className="flex-1 sm:flex-none h-7 px-2.5 rounded-lg text-[12px] font-semibold hairline hover:bg-[var(--hair-2)] transition-colors ink-2">Edit</button>
                  <button onClick={() => toggleActive.mutate({ id: m.id, isActive: !m.is_active })}
                    className="flex-1 sm:flex-none h-7 px-2.5 rounded-lg text-[12px] font-semibold hairline hover:bg-[var(--hair-2)] transition-colors"
                    style={{ color: m.is_active ? 'var(--warn)' : 'var(--accent)' }}>
                    {m.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => setDelId(m.id)} className="flex-1 sm:flex-none h-7 px-2.5 rounded-lg text-[12px] font-semibold hairline hover:bg-[var(--rose-soft)] transition-colors" style={{ color: 'var(--rose)' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CreateModuleDialog open={creating} onClose={() => setCreating(false)} />
      <EditModuleDialog moduleId={editingId} onClose={() => setEditingId(null)} />
      <ConfirmDelete open={!!delId} onClose={() => setDelId(null)} label="module"
        loading={deleteModule.isPending} onConfirm={() => { if (delId) deleteModule.mutate(delId, { onSuccess: () => setDelId(null) }) }} />
    </>
  )
}

// ── Projects tab ────────────────────────────────────────────────────────────

function ProjectsTab() {
  const { user } = useAuthStore()
  const { data: projects = [], isLoading } = useAllProjectsAdmin()
  const { data: modules  = [] } = useAllModulesAdmin()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()
  const toggleActive  = useToggleProjectActive()

  const [mode,   setMode  ] = useState<DialogMode>(null)
  const [target, setTarget] = useState<Project | null>(null)
  const [delId,  setDelId ] = useState<string | null>(null)
  const [form,   setForm  ] = useState({ title: '', description: '', requirements: '', due_date: '', module_id: '' })

  const openCreate = () => { setForm({ title:'', description:'', requirements:'', due_date:'', module_id:'' }); setTarget(null); setMode('create') }
  const openEdit   = (p: Project) => { setForm({ title: p.title, description: p.description, requirements: p.requirements, due_date: p.due_date.slice(0,10), module_id: p.module_id ?? '' }); setTarget(p); setMode('edit') }

  const handleSave = () => {
    if (!user) return
    const payload = { ...form, module_id: form.module_id || undefined }
    if (mode === 'create') createProject.mutate({ adminId: user.id, payload }, { onSuccess: () => setMode(null) })
    else if (target) updateProject.mutate({ id: target.id, payload: { ...payload, module_id: form.module_id || null } }, { onSuccess: () => setMode(null) })
  }

  const pending = createProject.isPending || updateProject.isPending

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate} style={{ background: 'var(--primary)', color: '#fff' }}>+ Create project</Button>
      </div>
      {isLoading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      : projects.length === 0 ? <EmptyState title="No projects yet" description="Create the first project assignment." action={<Button onClick={openCreate} style={{ background: 'var(--primary)', color: '#fff' }}>Create project</Button>} />
      : (
        <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
          <div className="divide-y divide-[var(--hair)]">
            {projects.map(p => (
              <div key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-[14px] font-semibold truncate">{p.title}</span>
                    {!p.is_active && <span className="tag" style={{ background: 'var(--hair-2)', color: 'var(--muted)' }}>Inactive</span>}
                  </div>
                  <div className="text-[12px] font-mono muted">Due {fmtDate(p.due_date)}</div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => openEdit(p)} className="flex-1 sm:flex-none h-7 px-2.5 rounded-lg text-[12px] font-semibold hairline hover:bg-[var(--hair-2)] transition-colors ink-2">Edit</button>
                  <button onClick={() => toggleActive.mutate({ id: p.id, isActive: !p.is_active })}
                    className="flex-1 sm:flex-none h-7 px-2.5 rounded-lg text-[12px] font-semibold hairline hover:bg-[var(--hair-2)] transition-colors"
                    style={{ color: p.is_active ? 'var(--warn)' : 'var(--accent)' }}>
                    {p.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => setDelId(p.id)} className="flex-1 sm:flex-none h-7 px-2.5 rounded-lg text-[12px] font-semibold hairline hover:bg-[var(--rose-soft)] transition-colors" style={{ color: 'var(--rose)' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!mode} onOpenChange={v => !v && setMode(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{mode === 'create' ? 'Create project' : 'Edit project'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-[12.5px] font-medium ink-2 block mb-1.5">Title</label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div><label className="text-[12.5px] font-medium ink-2 block mb-1.5">Description</label><Textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div><label className="text-[12.5px] font-medium ink-2 block mb-1.5">Requirements</label><Textarea rows={3} value={form.requirements} onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="text-[12.5px] font-medium ink-2 block mb-1.5">Due date</label><Input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} /></div>
              <div><label className="text-[12.5px] font-medium ink-2 block mb-1.5">Linked module <span className="muted font-normal">(opt.)</span></label>
                <Select value={form.module_id || 'none'} onValueChange={v => setForm(p => ({ ...p, module_id: v === 'none' ? '' : v }))}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {modules.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setMode(null)}>Cancel</Button>
              <Button className="flex-1" disabled={pending} style={{ background: 'var(--primary)', color: '#fff' }} onClick={handleSave}>{pending ? 'Saving…' : 'Save'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDelete open={!!delId} onClose={() => setDelId(null)} label="project"
        loading={deleteProject.isPending} onConfirm={() => { if (delId) deleteProject.mutate(delId, { onSuccess: () => setDelId(null) }) }} />
    </>
  )
}

// ── Indie projects tab ──────────────────────────────────────────────────────

function IndieProjectsTab() {
  const { data: projects = [], isLoading } = useAllIndependentProjectsAdmin()
  const deleteProj = useDeleteIndependentProject()
  const [delId, setDelId] = useState<string | null>(null)

  const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
    in_progress: { bg: 'var(--warn-soft)',    color: 'var(--warn)'    },
    submitted:   { bg: 'var(--primary-soft)', color: 'var(--primary)' },
    completed:   { bg: 'var(--accent-soft)',  color: 'var(--accent)'  },
  }

  return (
    <>
      {isLoading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      : projects.length === 0 ? <EmptyState title="No independent projects" description="Students haven't created any yet." />
      : (
        <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
          <div className="divide-y divide-[var(--hair)]">
            {projects.map(p => {
              const st = STATUS_STYLE[p.status] ?? STATUS_STYLE.in_progress
              return (
                <div key={p.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-[14px] font-semibold truncate">{p.title}</span>
                      <span className="tag capitalize" style={{ background: st.bg, color: st.color }}>{p.status.replace('_',' ')}</span>
                    </div>
                    <div className="text-[12px] font-mono muted">{p.profiles?.full_name ?? '—'} · {p.profiles?.email ?? '—'}</div>
                  </div>
                  <button onClick={() => setDelId(p.id)} className="h-7 px-2.5 rounded-lg text-[12px] font-semibold hairline hover:bg-[var(--rose-soft)] transition-colors shrink-0 self-start sm:self-auto" style={{ color: 'var(--rose)' }}>Delete</button>
                </div>
              )
            })}
          </div>
        </div>
      )}
      <ConfirmDelete open={!!delId} onClose={() => setDelId(null)} label="project"
        loading={deleteProj.isPending} onConfirm={() => { if (delId) deleteProj.mutate(delId, { onSuccess: () => setDelId(null) }) }} />
    </>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

export function ContentManagement() {
  return (
    <div className="p-6 lg:p-8 max-w-[1000px]">
      <PageHeader label="Admin" title="Content Management" description="Manage learning modules, projects, and independent projects." />
      <Tabs defaultValue="modules">
        <TabsList className="mb-6">
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="indie">Independent Projects</TabsTrigger>
        </TabsList>
        <TabsContent value="modules"><ModulesTab /></TabsContent>
        <TabsContent value="projects"><ProjectsTab /></TabsContent>
        <TabsContent value="indie"><IndieProjectsTab /></TabsContent>
      </Tabs>
    </div>
  )
}
