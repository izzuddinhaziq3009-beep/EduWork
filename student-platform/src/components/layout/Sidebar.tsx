import { NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

const Icons = {
  home:    (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>,
  book:    (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2V5z"/><path d="M9 7h7M9 11h7"/></svg>,
  folder:  (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>,
  chart:   (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg>,
  users:   (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2 21c.7-3.6 3.6-5.5 7-5.5s6.3 1.9 7 5.5"/><circle cx="17" cy="6" r="2.5"/><path d="M15.5 14.5c2.8.3 5.1 1.9 6.5 4.5"/></svg>,
  brief:   (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></svg>,
  spark:   (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/></svg>,
  flag:    (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 21V4"/><path d="M5 5h12l-2 4 2 4H5"/></svg>,
  inbox:   (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 13l3-8h12l3 8"/><path d="M3 13h5l1 3h6l1-3h5v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z"/></svg>,
  hand:    (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M8 12V5a2 2 0 1 1 4 0v7"/><path d="M12 12V4a2 2 0 1 1 4 0v8"/><path d="M16 12V6a2 2 0 1 1 4 0v9a6 6 0 0 1-6 6H10a4 4 0 0 1-4-4v-1L3 12a2 2 0 1 1 3-3l2 3"/></svg>,
  msg:     (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12a7 7 0 0 1-10.6 6l-4.4 1 1.1-4A7 7 0 1 1 21 12z"/></svg>,
  plus:    (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  shield:  (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l9 3v6c0 5-4 9-9 9s-9-4-9-9V6l9-3z"/><path d="M9 12l2 2 4-4"/></svg>,
  server:  (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/><circle cx="7" cy="7" r="0.5" fill="currentColor"/><circle cx="7" cy="17" r="0.5" fill="currentColor"/></svg>,
  arrow:   (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  fire:    (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3s4 4 4 8a4 4 0 1 1-8 0c0-1 .4-2 .8-2.6C9 9.8 8 8 8 6c1 1.4 2 1.6 3 1.4C10 5 12 3 12 3z"/></svg>,
}

interface NavItem {
  label: string
  to: string
  icon: keyof typeof Icons
  count?: number
  badge?: string
  dot?: boolean
}

const STUDENT_NAV: NavItem[] = [
  { label: 'Dashboard',             to: '/dashboard',             icon: 'home'   },
  { label: 'Learning Modules',      to: '/modules',               icon: 'book'   },
  { label: 'Projects',              to: '/projects',              icon: 'folder' },
  { label: 'My Progress',           to: '/progress',              icon: 'chart'  },
  { label: 'Mentorship',            to: '/mentorship',            icon: 'users'  },
  { label: 'Portfolio',             to: '/portfolio',             icon: 'brief'  },
  { label: 'Independent Projects',  to: '/independent-projects',  icon: 'spark'  },
  { label: 'Industry Challenges',   to: '/challenges',            icon: 'flag', badge: 'NEW' },
]

const MENTOR_NAV: NavItem[] = [
  { label: 'Dashboard',            to: '/mentor/dashboard',           icon: 'home'  },
  { label: 'Student Submissions',  to: '/mentor/submissions',         icon: 'inbox' },
  { label: 'Mentorship Requests',  to: '/mentor/mentorship-requests', icon: 'hand', dot: true },
  { label: 'Messages',             to: '/mentor/messages',            icon: 'msg'   },
]

const COMPANY_NAV: NavItem[] = [
  { label: 'Dashboard',      to: '/company/dashboard',    icon: 'home'   },
  { label: 'Post Challenge', to: '/company/post-challenge', icon: 'plus', badge: 'NEW' },
  { label: 'My Challenges',  to: '/company/challenges',   icon: 'flag'   },
  { label: 'Submissions',    to: '/company/submissions',  icon: 'inbox'  },
]

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard',           to: '/admin/dashboard',   icon: 'home'   },
  { label: 'User Management',     to: '/admin/users',       icon: 'users'  },
  { label: 'Content Management',  to: '/admin/content',     icon: 'book'   },
  { label: 'Challenge Moderation', to: '/admin/challenges', icon: 'shield', dot: true },
  { label: 'System Monitoring',   to: '/admin/monitoring',  icon: 'server' },
]

export function Sidebar() {
  const { role, profile } = useAuthStore()
  const location = useLocation()

  const nav =
    role === 'mentor'  ? MENTOR_NAV  :
    role === 'company' ? COMPANY_NAV :
    role === 'admin'   ? ADMIN_NAV   : STUDENT_NAV

  const sectionLabel =
    role === 'mentor'  ? 'MENTOR TOOLS' :
    role === 'company' ? 'COMPANY TOOLS' :
    role === 'admin'   ? 'ADMIN TOOLS' : 'NAVIGATE'

  const isActive = (to: string) =>
    to === '/'
      ? location.pathname === to
      : location.pathname === to || location.pathname.startsWith(to + '/')

  return (
    <aside className="hairline-r bg-surface flex flex-col" style={{ width: 264, minHeight: '100%' }}>
      <div className="px-5 pt-6 pb-3">
        <div className="font-mono text-[10px] tracking-[0.14em] muted">{sectionLabel}</div>
      </div>

      <nav className="px-3 flex flex-col gap-0.5">
        {nav.map(item => {
          const Ico = Icons[item.icon]
          const active = isActive(item.to)
          return (
            <NavLink key={item.to} to={item.to}
              className={() =>
                `nav-item ${active ? 'active' : ''} flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium`
              }
              style={{ color: active ? '#fff' : 'var(--ink-2)' }}>
              <Ico width={18} height={18} className="ico shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.count != null && !active && (
                <span className="font-mono text-[10.5px] muted">{item.count}</span>
              )}
              {item.dot && !active && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
              )}
              {item.badge && (
                <span className="font-mono text-[9.5px] px-1.5 py-0.5 rounded"
                  style={{
                    background: active ? 'rgba(255,255,255,0.18)' : 'var(--rose-soft)',
                    color:      active ? '#fff' : 'var(--rose)'
                  }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Track card (students only) */}
      {role === 'student' && (
        <>
          <div className="px-5 pt-8 pb-2">
            <div className="font-mono text-[10px] tracking-[0.14em] muted">YOUR TRACK</div>
          </div>
          <div className="px-3 pb-4">
            <div className="hairline rounded-xl p-4 relative overflow-hidden" style={{ background: '#FBFAF5' }}>
              <div className="absolute inset-0 stripe-soft opacity-60 pointer-events-none" />
              <div className="relative">
                <div className="text-[11px] font-mono muted uppercase">PRODUCT DESIGN · YR 2</div>
                <div className="text-[15px] font-semibold mt-0.5">Designer-to-PM Pathway</div>
                <div className="mt-3 flex items-baseline justify-between">
                  <div className="text-[11px] muted">Overall progress</div>
                  <div className="font-mono text-[12px] font-semibold">60%</div>
                </div>
                <div className="pbar teal mt-1.5"><span style={{ width: '60%' }} /></div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom referral nudge */}
      <div className="mt-auto px-3 pb-5">
        <div className="hairline rounded-xl px-3 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg grid place-items-center shrink-0"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
            <Icons.spark width={18} height={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold leading-tight">
              {profile?.full_name?.split(' ')[0] ?? 'Welcome'}
            </div>
            <div className="text-[11px] muted capitalize">{role ?? 'user'}</div>
          </div>
          <Icons.arrow width={14} height={14} className="text-[color:var(--muted)]" />
        </div>
      </div>
    </aside>
  )
}
