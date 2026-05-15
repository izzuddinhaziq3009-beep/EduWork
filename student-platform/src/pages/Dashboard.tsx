import { useAuthStore } from '@/stores/authStore'

export function Dashboard() {
  const { profile } = useAuthStore()
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Student'

  return (
    <div className="p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <div className="font-mono text-[11px] tracking-[0.18em] muted uppercase mb-1">
          Today · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <h1 className="font-display text-[38px] font-semibold tracking-tight leading-[1.05]">
          Welcome back, <span style={{ color: 'var(--primary)' }}>{firstName}</span>.
        </h1>
        <p className="muted text-[15px] mt-2 max-w-[600px]">
          Your learning dashboard is ready. Full content coming soon — modules, projects, mentorship, and challenges will appear here.
        </p>
      </div>

      {/* Placeholder KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Modules Completed', value: '—', color: 'var(--primary)' },
          { label: 'Projects Submitted', value: '—', color: 'var(--accent)' },
          { label: 'Active Mentorship',  value: '—', color: 'var(--warn)'   },
          { label: 'Challenges',         value: '—', color: 'var(--rose)'   },
        ].map(card => (
          <div key={card.label} className="bg-surface hairline rounded-2xl shadow-card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-12 rounded-br-lg" style={{ background: card.color }} />
            <div className="text-[12px] font-mono tracking-wide muted uppercase mb-3">{card.label}</div>
            <div className="font-display text-[42px] leading-none font-semibold tracking-tight"
              style={{ color: 'var(--ink)' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Coming soon */}
      <div className="bg-surface hairline rounded-2xl shadow-card p-10 text-center">
        <div className="w-14 h-14 rounded-2xl grid place-items-center mx-auto mb-4"
          style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/>
          </svg>
        </div>
        <h2 className="font-display text-[22px] font-semibold tracking-tight mb-2">Student Dashboard</h2>
        <p className="muted text-[14px] max-w-md mx-auto leading-relaxed">
          Full dashboard content — learning modules, project feed, activity timeline, and upcoming schedule — will be built in the next phase.
        </p>
      </div>
    </div>
  )
}
