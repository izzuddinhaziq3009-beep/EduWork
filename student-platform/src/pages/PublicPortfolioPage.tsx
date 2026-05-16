import { useParams, Link } from 'react-router-dom'
import { usePublicPortfolio } from '@/hooks/usePortfolio'
import { PortfolioItemCard } from '@/components/features/portfolio/PortfolioItemCard'
import { Skeleton } from '@/components/ui/skeleton'
import { fmtInitials } from '@/utils/formatters'

export function PublicPortfolioPage() {
  const { publicUrl = '' } = useParams()
  const { data, isLoading } = usePublicPortfolio(publicUrl)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] p-8 max-w-[860px] mx-auto">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-24 w-full rounded-2xl mb-6" />
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="font-mono text-[60px] font-bold leading-none" style={{ color: 'var(--hair)' }}>404</div>
          <h1 className="font-display text-[24px] font-semibold mt-2">Portfolio not found</h1>
          <p className="muted text-[14px] mt-2">This portfolio may be private or doesn't exist.</p>
          <Link to="/" className="mt-4 inline-block text-[13px] font-medium" style={{ color: 'var(--primary)' }}>Go home</Link>
        </div>
      </div>
    )
  }

  const { portfolio, items } = data

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="bg-surface hairline-b">
        <div className="max-w-[860px] mx-auto px-8 py-5 flex items-center gap-3">
          <Link to="/" style={{ color: 'var(--primary)' }}>
            <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
              <rect x="2" y="2" width="28" height="28" rx="7" fill="currentColor"/>
              <path d="M9 20.5L16 9l7 11.5H17.5L16 18l-1.5 2.5H9z" fill="#fff"/>
              <circle cx="16" cy="22.5" r="1.5" fill="#fff"/>
            </svg>
          </Link>
          <span className="font-mono text-[11px] tracking-[0.18em] muted uppercase">Student portfolio</span>
        </div>
      </header>

      <div className="max-w-[860px] mx-auto px-8 py-10">
        {/* Profile */}
        <div className="flex items-start gap-5 mb-8">
          <div className="w-16 h-16 rounded-2xl grid place-items-center font-mono font-bold text-white text-[22px] shrink-0"
            style={{ background: 'var(--primary)' }}>
            {fmtInitials(portfolio.title)}
          </div>
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-tight">{portfolio.title}</h1>
            <p className="text-[15px] muted mt-2 max-w-[600px] leading-relaxed">{portfolio.bio}</p>
          </div>
        </div>

        {/* Skills */}
        {portfolio.skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[14px] font-semibold mb-3 muted uppercase tracking-wide font-mono">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {portfolio.skills.map(s => (
                <span key={s} className="tag" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Work */}
        <div>
          <h2 className="text-[14px] font-semibold mb-4 muted uppercase tracking-wide font-mono">Work ({items.length})</h2>
          {items.length === 0 ? (
            <p className="muted text-[14px]">No portfolio items yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {items.map(item => <PortfolioItemCard key={item.id} item={item} />)}
            </div>
          )}
        </div>

        <footer className="mt-12 text-[11.5px] muted font-mono">
          EDUWORK · STUDENT EXPERIENCE PLATFORM
        </footer>
      </div>
    </div>
  )
}
