import { useEffect, useState } from 'react'
import { Sidebar } from './Sidebar'

// Hamburger trigger + slide-out drawer containing the same nav as the desktop
// Sidebar. Hidden entirely on lg+ screens, where the real Sidebar is visible instead.
export function MobileMenu() {
  const [open, setOpen] = useState(false)

  // Lock background scroll and allow Escape to close while the drawer is open.
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="lg:hidden w-11 h-11 grid place-items-center rounded-lg hover:bg-[var(--hair-2)] transition-colors shrink-0"
        aria-label="Open menu">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--ink-2)' }}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 fade-in" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 max-w-[80vw] shadow-pop slide-in-left">
            <button onClick={() => setOpen(false)}
              className="absolute top-2 right-1 z-10 w-11 h-11 grid place-items-center rounded-lg hover:bg-[var(--hair-2)] transition-colors"
              aria-label="Close menu" style={{ color: 'var(--ink-2)' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
