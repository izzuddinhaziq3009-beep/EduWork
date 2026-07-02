import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import {
  useMentorClasses, useCreateClass, useResetClassCode, useDeactivateClass, useClassRoster,
} from '@/hooks/useClasses'
import { useModules } from '@/hooks/useModules'
import { Skeleton } from '@/components/ui/skeleton'
import { fmtInitials } from '@/utils/formatters'
import type { ClassWithMeta } from '@/services/classService'

const COLORS = ['#0F4C5C', '#2C9D6E', '#C97A2D', '#B8456A', '#3B6AC9']
function avatarColor(name: string) { return COLORS[name.charCodeAt(0) % COLORS.length] }

// ── ClassCard ─────────────────────────────────────────────────────────────────

interface ClassCardProps {
  cls: ClassWithMeta
  mentorId: string
  copiedId: string | null
  onCopy: (code: string, classId: string) => void
  onResetCode: (classId: string) => void
  onDeactivate: (classId: string) => void
  isResetting: boolean
  isDeactivating: boolean
}

function ClassCard({
  cls, mentorId, copiedId,
  onCopy, onResetCode, onDeactivate,
  isResetting, isDeactivating,
}: ClassCardProps) {
  const [showRoster, setShowRoster] = useState(false)
  const { data: roster = [], isLoading: loadingRoster } = useClassRoster(showRoster ? cls.id : '')

  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      <div className="px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-[15px] font-semibold">{cls.name}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                cls.is_active
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-[var(--hair-2)] muted'
              }`}>
                {cls.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="text-[12.5px] muted">
              {cls.module_title} · {cls.enrolled_count} student{cls.enrolled_count !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[var(--hair-2)] rounded-lg px-3 h-9">
            <span className="font-mono text-[14px] tracking-widest font-semibold"
              style={{ color: 'var(--primary)' }}>
              {cls.join_code}
            </span>
          </div>

          {cls.is_active && (
            <>
              <button
                onClick={() => onCopy(cls.join_code, cls.id)}
                className="h-9 px-3 rounded-lg text-[12.5px] font-medium hairline hover:bg-[var(--hair-2)] transition-colors font-mono"
                style={{ color: 'var(--primary)' }}>
                {copiedId === cls.id ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={() => onResetCode(cls.id)}
                disabled={isResetting}
                className="h-9 px-3 rounded-lg text-[12.5px] font-medium hairline hover:bg-[var(--hair-2)] transition-colors disabled:opacity-50">
                {isResetting ? 'Resetting…' : 'Reset code'}
              </button>
            </>
          )}

          <button
            onClick={() => setShowRoster(v => !v)}
            className="h-9 px-3 rounded-lg text-[12.5px] font-medium hairline hover:bg-[var(--hair-2)] transition-colors">
            {showRoster ? 'Hide roster' : 'View roster'}
          </button>

          {cls.is_active && (
            <button
              onClick={() => onDeactivate(cls.id)}
              disabled={isDeactivating}
              className="h-9 px-3 rounded-lg text-[12.5px] font-medium hairline hover:bg-[var(--hair-2)] transition-colors disabled:opacity-50"
              style={{ color: 'var(--rose)' }}>
              {isDeactivating ? 'Deactivating…' : 'Deactivate'}
            </button>
          )}
        </div>
      </div>

      {showRoster && (
        <div className="hairline-t px-6 py-4">
          <div className="text-[11px] font-mono tracking-wide muted uppercase mb-3">
            Enrolled students ({cls.enrolled_count})
          </div>
          {loadingRoster ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-7 w-full rounded-lg" />
                  <Skeleton className="h-2 w-full rounded-full ml-9" />
                </div>
              ))}
            </div>
          ) : roster.length === 0 ? (
            <p className="text-[13px] muted">No students enrolled yet.</p>
          ) : (
            <div className="space-y-3">
              {roster.map(({ student, progress, completed }) => {
                const pct = Math.min(100, Math.max(0, Math.round(progress)))
                return (
                  <div key={student.id} className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg grid place-items-center text-[11px] font-mono font-semibold text-white shrink-0"
                        style={{ background: avatarColor(student.full_name) }}>
                        {fmtInitials(student.full_name)}
                      </div>
                      <span className="flex-1 text-[13.5px]">{student.full_name}</span>
                      {completed && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Completed
                        </span>
                      )}
                      <span className="font-mono text-[11.5px] font-semibold shrink-0">{pct}%</span>
                    </div>
                    <div className="pbar teal ml-9"><span style={{ width: `${pct}%` }} /></div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── MentorClasses page ────────────────────────────────────────────────────────

export function MentorClasses() {
  const { user } = useAuthStore()
  const mid = user?.id ?? ''

  const { data: classes = [], isLoading } = useMentorClasses(mid)
  const { data: modules = [] }            = useModules()

  const createClassMut = useCreateClass()
  const resetCode      = useResetClassCode()
  const deactivate     = useDeactivateClass()

  const [showCreate, setShowCreate] = useState(false)
  const [moduleId, setModuleId]     = useState('')
  const [className, setClassName]   = useState('')
  const [copiedId, setCopiedId]     = useState<string | null>(null)

  const handleCreate = () => {
    if (!moduleId || !className.trim()) return
    createClassMut.mutate(
      {
        moduleId,
        name: className.trim(),
        mentorId: mid,
        moduleTitle: modules.find(m => m.id === moduleId)?.title ?? 'Unknown Module',
      },
      { onSuccess: () => { setShowCreate(false); setModuleId(''); setClassName('') } },
    )
  }

  const handleCopy = async (code: string, classId: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedId(classId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="p-6 lg:p-8 max-w-[900px]">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] muted uppercase mb-1">Mentor workspace</div>
          <h1 className="font-display text-[32px] font-semibold tracking-tight">My Classes</h1>
          <p className="muted text-[14px] mt-1">
            Create classes, share join codes, and manage your student rosters.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(v => !v)}
          className="shrink-0 h-10 px-4 rounded-xl text-[13.5px] font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: 'var(--primary)' }}>
          + Create a Class
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-surface hairline rounded-2xl shadow-card p-6 mb-6">
          <h2 className="text-[15px] font-semibold mb-4">New class</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-mono tracking-wide muted uppercase block mb-1.5">
                Module
              </label>
              <select
                value={moduleId}
                onChange={e => setModuleId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl hairline bg-[var(--bg)] text-[14px] outline-none focus:ring-2 focus:ring-[var(--primary)]">
                <option value="">Select a module…</option>
                {modules.filter(m => m.is_active).map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-mono tracking-wide muted uppercase block mb-1.5">
                Class name
              </label>
              <input
                type="text"
                value={className}
                onChange={e => setClassName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="e.g. Cohort A – Spring 2025"
                maxLength={120}
                className="w-full h-10 px-3 rounded-xl hairline bg-[var(--bg)] text-[14px] outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreate}
                disabled={!moduleId || !className.trim() || createClassMut.isPending}
                className="h-10 px-5 rounded-xl text-[13.5px] font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
                style={{ background: 'var(--primary)' }}>
                {createClassMut.isPending ? 'Creating…' : 'Create'}
              </button>
              <button
                onClick={() => { setShowCreate(false); setModuleId(''); setClassName('') }}
                className="h-10 px-4 rounded-xl text-[13.5px] font-medium hairline hover:bg-[var(--hair-2)] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Classes list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-surface hairline rounded-2xl p-5 space-y-3">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-surface hairline rounded-2xl shadow-card p-12 text-center">
          <div className="w-14 h-14 rounded-2xl grid place-items-center mx-auto mb-4"
            style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
              strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
          </div>
          <div className="text-[15px] font-semibold mb-1">No classes yet</div>
          <p className="text-[13px] muted max-w-xs mx-auto">
            Create your first class to get a join code you can share with students.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map(cls => (
            <ClassCard
              key={cls.id}
              cls={cls}
              mentorId={mid}
              copiedId={copiedId}
              onCopy={handleCopy}
              onResetCode={classId => resetCode.mutate({ classId, mentorId: mid })}
              onDeactivate={classId => deactivate.mutate({ classId, mentorId: mid })}
              isResetting={resetCode.isPending && resetCode.variables?.classId === cls.id}
              isDeactivating={deactivate.isPending && deactivate.variables?.classId === cls.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
