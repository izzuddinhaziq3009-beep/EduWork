import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  useAllUsers, useUpdateUser, useDeactivateUser, useReactivateUser, useCreateUser,
} from '@/hooks/useAdmin'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fmtDate, fmtInitials } from '@/utils/formatters'
import type { Profile, UserRole } from '@/types'

const ROLE_COLORS: Record<UserRole, { bg: string; color: string }> = {
  student: { bg: 'var(--primary-soft)', color: 'var(--primary)' },
  mentor:  { bg: 'var(--accent-soft)',  color: 'var(--accent)'  },
  company: { bg: 'var(--warn-soft)',    color: 'var(--warn)'    },
  admin:   { bg: 'var(--rose-soft)',    color: 'var(--rose)'    },
}
const AVATAR_COLORS = ['#0F4C5C','#2C9D6E','#C97A2D','#B8456A','#3B6AC9']
function avatarColor(n: string) { return AVATAR_COLORS[n.charCodeAt(0) % AVATAR_COLORS.length] }

export function UserManagement() {
  const [params]     = useSearchParams()
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>((params.get('role') as UserRole) ?? 'all')
  const [search,     setSearch    ] = useState('')
  const [editTarget, setEditTarget] = useState<Profile | null>(null)
  const [editName,   setEditName  ] = useState('')
  const [editEmail,  setEditEmail ] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ full_name: '', email: '', password: '', role: 'student' as UserRole })

  const { data: users = [], isLoading } = useAllUsers(roleFilter === 'all' ? undefined : roleFilter)
  const updateUser   = useUpdateUser()
  const deactivate   = useDeactivateUser()
  const reactivate   = useReactivateUser()
  const createUser   = useCreateUser()

  const filtered = users.filter(u =>
    !search || u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()),
  )

  const openEdit = (u: Profile) => { setEditTarget(u); setEditName(u.full_name); setEditEmail(u.email) }

  const handleSaveEdit = () => {
    if (!editTarget) return
    updateUser.mutate({ userId: editTarget.id, data: { full_name: editName, email: editEmail } }, {
      onSuccess: () => setEditTarget(null),
    })
  }

  const handleCreate = () => {
    createUser.mutate(createForm, {
      onSuccess: () => { setShowCreate(false); setCreateForm({ full_name: '', email: '', password: '', role: 'student' }) },
    })
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1200px]">
      <PageHeader
        label="Admin"
        title="User Management"
        description="View and manage all platform users."
        action={<Button onClick={() => setShowCreate(true)} style={{ background: 'var(--primary)', color: '#fff' }}>+ Create user</Button>}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-[300px]" />
        <div className="hairline rounded-xl p-1 flex bg-[var(--hair-2)] w-fit">
          {(['all','student','mentor','company'] as const).map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors capitalize ${roleFilter === r ? 'bg-[var(--surface)] shadow-card ink' : 'muted hover:text-[color:var(--ink)]'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-[var(--hair)]">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/4" /></div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2 21c.7-3.6 3.6-5.5 7-5.5s6.3 1.9 7 5.5"/></svg>}
          title={search ? 'No users match your search' : 'No users yet'}
          description={search ? 'Try a different name or email.' : 'Users will appear here once they register.'}
        />
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden lg:block bg-surface hairline rounded-2xl shadow-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="hairline-b">
                  {['User','Email','Role','Status','Joined','Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11.5px] font-mono tracking-wide muted uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--hair)]">
                {filtered.map(u => {
                  const rc = ROLE_COLORS[u.role]
                  const isActive = u.is_active !== false
                  return (
                    <tr key={u.id} className="hover:bg-[var(--hair-2)] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg grid place-items-center font-mono font-semibold text-white text-[11px] shrink-0"
                            style={{ background: avatarColor(u.full_name) }}>
                            {fmtInitials(u.full_name)}
                          </div>
                          <Link to={`/admin/users/${u.id}`}
                            className="text-[13.5px] font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                            {u.full_name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] muted font-mono">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className="tag capitalize" style={{ background: rc.bg, color: rc.color }}>{u.role}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="tag" style={isActive
                          ? { background: 'var(--accent-soft)', color: 'var(--accent)' }
                          : { background: 'var(--rose-soft)',   color: 'var(--rose)'   }}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[12.5px] font-mono muted">{fmtDate(u.created_at)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5">
                          <button onClick={() => openEdit(u)}
                            className="h-7 px-2.5 rounded-lg text-[12px] font-semibold hairline hover:bg-[var(--hair-2)] transition-colors ink-2">
                            Edit
                          </button>
                          {isActive ? (
                            <button onClick={() => deactivate.mutate(u.id)} disabled={u.role === 'admin'}
                              className="h-7 px-2.5 rounded-lg text-[12px] font-semibold hairline hover:bg-[var(--rose-soft)] disabled:opacity-40 transition-colors"
                              style={{ color: 'var(--rose)' }}>
                              Deactivate
                            </button>
                          ) : (
                            <button onClick={() => reactivate.mutate(u.id)}
                              className="h-7 px-2.5 rounded-lg text-[12px] font-semibold hairline hover:bg-[var(--accent-soft)] transition-colors"
                              style={{ color: 'var(--accent)' }}>
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="px-5 py-3 hairline-t text-[12px] font-mono muted">
              Showing {filtered.length} of {users.length} user{users.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Mobile: cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map(u => {
              const rc = ROLE_COLORS[u.role]
              const isActive = u.is_active !== false
              return (
                <div key={u.id} className="bg-surface hairline rounded-2xl shadow-card p-4">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-lg grid place-items-center font-mono font-semibold text-white text-[12px] shrink-0"
                      style={{ background: avatarColor(u.full_name) }}>
                      {fmtInitials(u.full_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link to={`/admin/users/${u.id}`}
                        className="text-[14px] font-medium hover:underline block truncate" style={{ color: 'var(--primary)' }}>
                        {u.full_name}
                      </Link>
                      <div className="text-[12px] muted font-mono truncate">{u.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="tag capitalize" style={{ background: rc.bg, color: rc.color }}>{u.role}</span>
                    <span className="tag" style={isActive
                      ? { background: 'var(--accent-soft)', color: 'var(--accent)' }
                      : { background: 'var(--rose-soft)',   color: 'var(--rose)'   }}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-[11.5px] font-mono muted ml-auto">{fmtDate(u.created_at)}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(u)}
                      className="flex-1 h-8 rounded-lg text-[12.5px] font-semibold hairline hover:bg-[var(--hair-2)] transition-colors ink-2">
                      Edit
                    </button>
                    {isActive ? (
                      <button onClick={() => deactivate.mutate(u.id)} disabled={u.role === 'admin'}
                        className="flex-1 h-8 rounded-lg text-[12.5px] font-semibold hairline hover:bg-[var(--rose-soft)] disabled:opacity-40 transition-colors"
                        style={{ color: 'var(--rose)' }}>
                        Deactivate
                      </button>
                    ) : (
                      <button onClick={() => reactivate.mutate(u.id)}
                        className="flex-1 h-8 rounded-lg text-[12.5px] font-semibold hairline hover:bg-[var(--accent-soft)] transition-colors"
                        style={{ color: 'var(--accent)' }}>
                        Reactivate
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            <div className="text-[12px] font-mono muted text-center pt-1">
              Showing {filtered.length} of {users.length} user{users.length !== 1 ? 's' : ''}
            </div>
          </div>
        </>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={open => !open && setEditTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit user</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-[12.5px] font-medium ink-2 block mb-1.5">Full name</label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
            <div>
              <label className="text-[12.5px] font-medium ink-2 block mb-1.5">Email</label>
              <Input value={editEmail} onChange={e => setEditEmail(e.target.value)} type="email" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditTarget(null)}>Cancel</Button>
              <Button className="flex-1" disabled={updateUser.isPending}
                style={{ background: 'var(--primary)', color: '#fff' }} onClick={handleSaveEdit}>
                {updateUser.isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Create user</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {[
              { label: 'Full name', key: 'full_name', type: 'text',     placeholder: 'Jane Smith'         },
              { label: 'Email',     key: 'email',     type: 'email',    placeholder: 'jane@example.com'   },
              { label: 'Password',  key: 'password',  type: 'password', placeholder: '••••••••'           },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[12.5px] font-medium ink-2 block mb-1.5">{f.label}</label>
                <Input type={f.type} placeholder={f.placeholder}
                  value={createForm[f.key as keyof typeof createForm]}
                  onChange={e => setCreateForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="text-[12.5px] font-medium ink-2 block mb-1.5">Role</label>
              <Select value={createForm.role} onValueChange={v => setCreateForm(p => ({ ...p, role: v as UserRole }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['student','mentor','company','admin'] as UserRole[]).map(r => (
                    <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" disabled={createUser.isPending}
              style={{ background: 'var(--primary)', color: '#fff' }} onClick={handleCreate}>
              {createUser.isPending ? 'Creating…' : 'Create user'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
