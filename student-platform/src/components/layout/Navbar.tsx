import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { useRealtimeNotifications, notifKeys } from '@/hooks/useMessages'
import { MobileMenu } from './MobileMenu'
import { MobileSearchModal } from './MobileSearchModal'
import type { Notification, UserRole } from '@/types'

// Narrow builders for notifications.update — bypasses `never` inference
type EqP = Promise<{ error: unknown }>
type NotifBulkReadBuilder   = { update(d: { read: boolean }): { eq(c: string, v: string): { eq(c: string, v: string | boolean): EqP } } }
type NotifSingleReadBuilder  = { update(d: { read: boolean }): { eq(c: string, v: string): EqP } }
function notifBulkTable()   { return supabase.from('notifications') as unknown as NotifBulkReadBuilder  }
function notifSingleTable() { return supabase.from('notifications') as unknown as NotifSingleReadBuilder }

type P = React.SVGProps<SVGSVGElement>
const BellIcon    = (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>
const ChevIcon    = (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9l6 6 6-6"/></svg>
const SearchIcon  = (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
const BriefIcon   = (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></svg>
const ExtIcon     = (p: P) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M7 17L17 7M9 7h8v8"/></svg>

const ROLE_LABELS: Record<string, string> = {
  student: 'STUDENT', mentor: 'MENTOR', company: 'COMPANY', admin: 'ADMIN',
}

function initials(name: string) {
  return name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
}

export function Navbar() {
  const { user, profile, role, signOut } = useAuthStore()
  const navigate  = useNavigate()
  const qc        = useQueryClient()

  const [openBell, setOpenBell] = useState(false)
  const [openMenu, setOpenMenu] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Real-time subscription — invalidates the query below when new notifications arrive
  useRealtimeNotifications(user?.id ?? '')

  // Fetch unread notifications (key matches notifKeys.unread so real-time invalidation works)
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: notifKeys.unread(user?.id ?? ''),
    queryFn: async () => {
      if (!user) return []
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(10)
      return (data ?? []) as unknown as Notification[]
    },
    enabled: !!user,
    staleTime: 30_000,
  })

  const unreadCount = notifications.length

  const markAllRead = async () => {
    if (!user || notifications.length === 0) return
    await notifBulkTable().update({ read: true }).eq('user_id', user.id).eq('read', 'false')
    qc.invalidateQueries({ queryKey: notifKeys.unread(user.id) })
  }

  const markOneRead = async (notifId: string) => {
    await notifSingleTable().update({ read: true }).eq('id', notifId)
    if (user) qc.invalidateQueries({ queryKey: notifKeys.unread(user.id) })
  }

  const handleNotifClick = (n: Notification) => {
    markOneRead(n.id)
    setOpenBell(false)
    const lTitle = n.title.toLowerCase()
    let path = '/dashboard'
    if (n.type === 'challenge') {
      if (lTitle.includes('approved') || lTitle.includes('rejected')) {
        path = role === 'company' ? '/company/challenges' : '/challenges'
      } else {
        path = role === 'company' ? '/company/submissions' : '/challenges'
      }
    } else if (n.type === 'mentorship') {
      path = role === 'mentor' ? '/mentor/mentorship-requests' : '/mentorship'
    } else if (n.type === 'feedback' || n.type === 'project') {
      path = role === 'mentor' ? '/mentor/submissions' : '/projects'
    } else if (n.type === 'system') {
      path = '/admin/users'
    }
    navigate(path)
  }

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (!bellRef.current?.contains(t) && !menuRef.current?.contains(t)) {
        setOpenBell(false)
        setOpenMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const name     = profile?.full_name ?? user?.email ?? 'User'
  const firstName = name.split(' ')[0]
  const badge    = role ? ROLE_LABELS[role] ?? role.toUpperCase() : ''

  return (
    <header className="chrome-dark hairline-b bg-surface sticky top-0 z-40" style={{ height: 64 }}>
      <div className="h-full flex items-center px-4 md:px-6 gap-3 md:gap-6">
        <MobileMenu />

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 select-none shrink-0" style={{ color: 'var(--primary)' }}>
          <svg viewBox="0 0 32 32" width="28" height="28" fill="none" className="w-7 h-7 lg:w-[28px] lg:h-[28px]">
            <rect x="2" y="2" width="28" height="28" rx="7" fill="currentColor"/>
            <path d="M9 20.5L16 9l7 11.5H17.5L16 18l-1.5 2.5H9z" fill="#fff"/>
            <circle cx="16" cy="22.5" r="1.5" fill="#fff"/>
          </svg>
          <span className="font-display text-[20px] font-semibold tracking-tight hidden sm:inline" style={{ color: 'var(--ink)' }}>Eduwork</span>
          {badge && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded hidden sm:inline"
              style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>{badge}</span>
          )}
        </Link>

        {/* Search (desktop bar) */}
        <div className="flex-1 max-w-[520px] hidden md:block">
          <label className="flex items-center gap-3 hairline rounded-xl px-3.5 h-10 bg-[var(--surface)] focus-within:ring-2 focus-within:ring-[var(--primary-soft)] focus-within:border-[color:var(--primary)] cursor-text">
            <SearchIcon width={17} height={17} className="text-[color:var(--muted)] shrink-0" />
            <input className="bg-transparent outline-none flex-1 text-sm placeholder:text-[color:var(--muted)]"
              placeholder="Search modules, projects, mentors…" style={{ color: 'var(--ink)' }} />
            <span className="kbd hidden lg:inline">⌘K</span>
          </label>
        </div>

        <div className="flex items-center gap-1 md:gap-2 ml-auto">
          {/* Search (mobile icon — opens full-screen modal) */}
          <button onClick={() => setSearchOpen(true)}
            className="md:hidden w-11 h-11 grid place-items-center rounded-xl hover:bg-[var(--hair-2)] ring-focus transition-colors"
            aria-label="Search">
            <SearchIcon width={19} height={19} style={{ color: 'var(--ink-2)' }} />
          </button>

          {/* Bell */}
          <div className="relative" ref={bellRef}>
            <button onClick={e => { e.stopPropagation(); setOpenBell(v => !v); setOpenMenu(false) }}
              className="relative w-11 h-11 grid place-items-center rounded-xl hover:bg-[var(--hair-2)] ring-focus transition-colors">
              <BellIcon width={20} height={20} style={{ color: 'var(--ink-2)' }} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 rounded-full flex items-center justify-center font-mono text-[9px] font-bold text-white px-1"
                  style={{ background: 'var(--rose)', boxShadow: '0 0 0 2px #fff' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {openBell && (
              <NotificationsPanel
                items={notifications}
                onClose={() => setOpenBell(false)}
                onMarkAllRead={() => { markAllRead(); setOpenBell(false) }}
                onItemClick={handleNotifClick}
              />
            )}
          </div>

          {/* Avatar dropdown */}
          <div className="relative" ref={menuRef}>
            <button onClick={e => { e.stopPropagation(); setOpenMenu(v => !v); setOpenBell(false) }}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-[var(--hair-2)] ring-focus transition-colors">
              <div className="w-8 h-8 rounded-lg grid place-items-center font-mono font-semibold text-white text-[13px] shrink-0"
                style={{ background: 'var(--primary)' }}>
                {initials(name)}
              </div>
              <div className="text-left leading-tight pr-0.5 hidden sm:block">
                <div className="text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>{firstName}</div>
                <div className="text-[11px] font-mono" style={{ color: 'var(--muted)' }}>{badge}</div>
              </div>
              <ChevIcon width={15} height={15} className="text-[color:var(--muted)] hidden sm:block" />
            </button>

            {openMenu && (
              <ProfileMenu name={name} email={user?.email ?? ''} role={role} onSignOut={handleSignOut} />
            )}
          </div>
        </div>
      </div>

      <MobileSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}

function NotificationsPanel({ items, onClose, onMarkAllRead, onItemClick }: { items: Notification[]; onClose: () => void; onMarkAllRead: () => void; onItemClick: (n: Notification) => void }) {
  const typeColors: Record<string, string> = {
    feedback:   'var(--accent)',
    mentorship: 'var(--primary)',
    challenge:  'var(--rose)',
    project:    'var(--warn)',
    system:     'var(--muted)',
  }

  return (
    <div className="pop-in absolute right-0 top-12 w-[360px] bg-surface hairline rounded-2xl shadow-pop overflow-hidden z-50">
      <div className="px-4 py-3 flex items-center justify-between hairline-b">
        <div className="font-semibold text-[15px] ink-2">Notifications</div>
        <button className="text-[12px] font-medium hover:underline" style={{ color: 'var(--primary)' }}
          onClick={onMarkAllRead}>Mark all read</button>
      </div>
      <div className="max-h-[380px] overflow-auto scroll-thin">
        {items.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] muted">No new notifications</div>
        ) : items.map(n => (
          <div key={n.id} onClick={() => onItemClick(n)}
            className="flex gap-3 px-4 py-3 hover:bg-[var(--hair-2)] cursor-pointer">
            <div className="mt-1.5 w-2 h-2 rounded-full shrink-0"
              style={{ background: typeColors[n.type] ?? 'var(--muted)' }} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate ink-2">{n.title}</div>
              <div className="text-[12px] muted truncate">{n.message}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2.5 hairline-t">
        <Link to="/notifications"
          className="block w-full text-center text-[12px] font-medium py-1.5 rounded-lg hover:bg-[var(--primary-soft)] transition-colors"
          style={{ color: 'var(--primary)' }} onClick={onClose}>
          View all notifications
        </Link>
      </div>
    </div>
  )
}

function ProfileMenu({ name, email, role, onSignOut }: { name: string; email: string; role: UserRole | null; onSignOut: () => void }) {
  const links = role === 'student'
    ? [{ label: 'Your portfolio', to: '/portfolio', Icon: BriefIcon }]
    : []

  return (
    <div className="pop-in absolute right-0 top-12 w-[260px] bg-surface hairline rounded-2xl shadow-pop overflow-hidden z-50">
      <div className="px-4 py-3.5 flex items-center gap-3 hairline-b"
        style={{ background: 'linear-gradient(180deg, var(--primary-soft), #fff)' }}>
        <div className="w-10 h-10 rounded-lg grid place-items-center font-mono font-semibold text-white shrink-0"
          style={{ background: 'var(--primary)' }}>
          {initials(name)}
        </div>
        <div className="min-w-0">
          <div className="text-[14px] font-semibold truncate">{name}</div>
          <div className="text-[12px] muted truncate font-mono">{email}</div>
        </div>
      </div>
      {links.length > 0 && (
        <div className="py-1.5">
          {links.map(({ label, to, Icon }) => (
            <Link key={to} to={to}
              className="flex items-center gap-3 px-4 py-2 text-[13px] hover:bg-[var(--hair-2)] transition-colors">
              <Icon width={16} height={16} className="text-[color:var(--muted)] shrink-0" />
              <span className="ink-2">{label}</span>
            </Link>
          ))}
        </div>
      )}
      <div className="hairline-t py-1.5">
        <button onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-2 text-[13px] hover:bg-[var(--hair-2)] transition-colors"
          style={{ color: 'var(--rose)' }}>
          <ExtIcon width={16} height={16} />
          Sign out
        </button>
      </div>
    </div>
  )
}
