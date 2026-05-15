export function BrandPanel() {
  const stats = [
    ['156', 'Active learners'],
    ['24',  'Mentors'],
    ['8',   'Company partners'],
  ] as const

  return (
    <aside className="hero-bg relative h-full overflow-hidden text-white flex flex-col" style={{ minHeight: '100vh' }}>
      <div className="absolute inset-0 hero-grid opacity-50 pointer-events-none" />
      <div className="absolute -right-24 -bottom-24 w-[420px] h-[420px] rounded-full hero-dots opacity-60 pointer-events-none" />
      <div className="absolute -left-10 top-1/3 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(44,157,110,0.30), transparent 60%)' }} />

      {/* Header */}
      <header className="relative px-12 pt-10 flex items-center gap-3">
        <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
          <rect x="2" y="2" width="28" height="28" rx="7" fill="#FFFFFF"/>
          <path d="M9 20.5L16 9l7 11.5H17.5L16 18l-1.5 2.5H9z" fill="#0F4C5C"/>
          <circle cx="16" cy="22.5" r="1.5" fill="#0F4C5C"/>
        </svg>
        <span className="font-display text-[26px] font-semibold tracking-tight">Eduwork</span>
        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded ml-1"
          style={{ background: 'rgba(255,255,255,0.16)' }}>PLATFORM</span>
      </header>

      {/* Pitch */}
      <div className="relative px-12 mt-14 flex-1 flex flex-col justify-center max-w-[520px]">
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase opacity-70">
          Student experience · platform
        </div>
        <h1 className="font-display text-[52px] leading-[1.05] font-semibold tracking-tight mt-3">
          A whole career,<br />built in cohorts.
        </h1>
        <p className="text-[16px] opacity-85 leading-relaxed mt-5 max-w-[460px]">
          Eduwork connects learners with mentors and real industry challenges — so the work you submit while studying is the same work that gets you hired.
        </p>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-3 gap-6 max-w-[440px]">
          {stats.map(([n, l], i) => (
            <div key={i}>
              <div className="font-display text-[34px] font-semibold leading-none">{n}</div>
              <div className="text-[12px] opacity-75 mt-1.5">{l}</div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <figure className="mt-10 rounded-2xl p-5 max-w-[460px]"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)' }}>
          <blockquote className="text-[14px] leading-relaxed opacity-95">
            "I sent three Eduwork case studies into my Notion application. They were the reason I got the interview — and the reason I got the job."
          </blockquote>
          <figcaption className="flex items-center gap-3 mt-4">
            <div className="w-9 h-9 rounded-lg grid place-items-center font-mono text-[12px] font-semibold"
              style={{ background: '#2C9D6E' }}>MR</div>
            <div className="text-[12.5px]">
              <div className="font-semibold">Maya Rodriguez</div>
              <div className="opacity-70 text-[11.5px]">Product Designer · Notion, cohort 24</div>
            </div>
          </figcaption>
        </figure>
      </div>

      {/* Footer */}
      <footer className="relative px-12 pb-8 flex items-center justify-between text-[11.5px] opacity-70 font-mono">
        <span>EDUWORK © 2026 · ALL RIGHTS RESERVED</span>
        <div className="flex items-center gap-4">
          <a className="hover:opacity-100 cursor-pointer">Privacy</a>
          <a className="hover:opacity-100 cursor-pointer">Terms</a>
        </div>
      </footer>
    </aside>
  )
}
