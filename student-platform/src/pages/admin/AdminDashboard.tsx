import { useAuthStore } from '@/stores/authStore'

export function AdminDashboard() {
  const { profile } = useAuthStore()
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Admin'

  return (
    <div className="p-8 max-w-[1400px]">
      <div className="mb-8">
        <div className="font-mono text-[11px] tracking-[0.18em] muted uppercase mb-1">
          Today · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <h1 className="font-display text-[38px] font-semibold tracking-tight leading-[1.05]">
          Admin Panel,{' '}
          <span style={{ color: 'var(--primary)' }}>{firstName}</span>.
        </h1>
        <p className="muted text-[15px] mt-2">Platform overview — users, content, challenges, and system health.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Total Users',          value: '—', color: 'var(--primary)' },
          { label: 'Active Modules',       value: '—', color: 'var(--accent)'  },
          { label: 'Pending Challenges',   value: '—', color: 'var(--rose)'    },
          { label: 'System Status',        value: 'OK', color: 'var(--accent)' },
        ].map(c => (
          <div key={c.label} className="bg-surface hairline rounded-2xl shadow-card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-12 rounded-br-lg" style={{ background: c.color }} />
            <div className="text-[12px] font-mono tracking-wide muted uppercase mb-3">{c.label}</div>
            <div className="font-display text-[42px] leading-none font-semibold tracking-tight" style={{ color: c.value === 'OK' ? 'var(--accent)' : 'var(--ink)' }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-surface hairline rounded-2xl shadow-card p-10 text-center">
        <div className="w-14 h-14 rounded-2xl grid place-items-center mx-auto mb-4"
          style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l9 3v6c0 5-4 9-9 9s-9-4-9-9V6l9-3z"/><path d="M9 12l2 2 4-4"/>
          </svg>
        </div>
        <h2 className="font-display text-[22px] font-semibold tracking-tight mb-2">Admin Dashboard</h2>
        <p className="muted text-[14px] max-w-md mx-auto leading-relaxed">
          Full admin tools — user management, content moderation, challenge approval, and system monitoring — coming in the next phase.
        </p>
      </div>
    </div>
  )
}
