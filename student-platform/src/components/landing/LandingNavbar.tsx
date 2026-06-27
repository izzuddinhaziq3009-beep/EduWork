import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EduWorkLogo } from './EduWorkLogo'

const LINKS = [
  { label: 'Learning',       href: '#modules' },
  { label: 'Certification',  href: '#benefits' },
  { label: 'Mentorship',     href: '#benefits' },
  { label: 'Challenges',     href: '#benefits' },
]

export function LandingNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
          <EduWorkLogo size={32} />
          EduWork
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
          {LINKS.map(l => (
            <a key={l.label} href={l.href} className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-300">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-300">
            Login
          </Link>
          <Link to="/signup"
            className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors duration-300 px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/30">
            Sign Up
          </Link>
        </div>

        <button onClick={() => setOpen(o => !o)} className="md:hidden text-white p-2 -mr-2" aria-label="Toggle menu" aria-expanded={open}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} />
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-slate-950 border-t border-white/10 px-6 py-4 space-y-3">
          {LINKS.map(l => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="block text-sm font-medium text-slate-300 hover:text-white">
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-300 hover:text-white">Login</Link>
            <Link to="/signup" onClick={() => setOpen(false)} className="text-sm font-semibold text-white bg-indigo-600 px-4 py-2 rounded-lg text-center">
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
