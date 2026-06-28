import { useEffect, useRef, useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
}

// Full-screen search panel shown on small screens, where the navbar's inline
// search bar is hidden. Mirrors the desktop bar's current (decorative,
// unwired) state — no search execution exists yet on either size.
export function MobileSearchModal({ open, onClose }: Props) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  if (!open) return null

  const close = () => { setValue(''); onClose() }

  return (
    <div className="chrome-dark md:hidden fixed inset-0 z-50 bg-surface fade-in">
      <div className="h-16 flex items-center gap-3 px-4 hairline-b">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="shrink-0" style={{ color: 'var(--muted)' }}>
          <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
        </svg>
        <input ref={inputRef} value={value} onChange={e => setValue(e.target.value)}
          placeholder="Search modules, projects, mentors…" autoFocus
          className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-[color:var(--muted)]"
          style={{ color: 'var(--ink)' }} />
        {value && (
          <button onClick={() => setValue('')} aria-label="Clear search" className="shrink-0" style={{ color: 'var(--muted)' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5l5 5M14.5 9.5l-5 5" /></svg>
          </button>
        )}
        <button onClick={close} className="shrink-0 text-[13px] font-semibold" style={{ color: 'var(--primary)' }}>Cancel</button>
      </div>
      <div className="px-4 py-10 text-center text-[13px]" style={{ color: 'var(--muted)' }}>Start typing to search…</div>
    </div>
  )
}
