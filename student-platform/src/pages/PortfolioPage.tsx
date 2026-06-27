import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import {
  useStudentPortfolio, useUpdatePortfolio, useTogglePublic,
  useAutoGeneratePortfolioItems,
} from '@/hooks/usePortfolio'
import { PortfolioEditor } from '@/components/features/portfolio/PortfolioEditor'
import { PortfolioItemCard } from '@/components/features/portfolio/PortfolioItemCard'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'

export function PortfolioPage() {
  const { user } = useAuthStore()
  const [copied, setCopied] = useState(false)
  const { data, isLoading } = useStudentPortfolio(user?.id ?? '')
  const update   = useUpdatePortfolio()
  const toggle   = useTogglePublic()
  const autoGen  = useAutoGeneratePortfolioItems()

  // Auto-generate portfolio items on mount whenever portfolio exists
  useEffect(() => {
    if (data?.portfolio && user) {
      autoGen.mutate({ studentId: user.id, portfolioId: data.portfolio.id })
    }
  }, [data?.portfolio?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const shareUrl = data?.portfolio?.is_public
    ? `${window.location.origin}/portfolio/${data.portfolio.public_url}`
    : null

  const copyLink = () => {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1100px]">
      <PageHeader
        label="Your public presence"
        title="Portfolio"
        description="Build and share your professional portfolio with mentors and recruiters."
      />

      {isLoading ? (
        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          <div className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-10 w-full" /></div>
          <div className="grid grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          {/* Editor panel */}
          <div className="space-y-5">
            <div className="bg-surface hairline rounded-2xl shadow-card p-5">
              <h2 className="text-[16px] font-semibold mb-4">{data?.portfolio ? 'Edit portfolio' : 'Create your portfolio'}</h2>
              <PortfolioEditor
                portfolio={data?.portfolio}
                saving={update.isPending}
                onSave={payload => user && update.mutate({
                  studentId: user.id,
                  portfolioId: data?.portfolio?.id,
                  data: payload,
                })}
              />
            </div>

            {data?.portfolio && (
              <div className="bg-surface hairline rounded-2xl shadow-card p-5 space-y-4">
                {/* Public toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[14px] font-semibold">Public portfolio</div>
                    <div className="text-[12px] muted">Make visible to recruiters and companies</div>
                  </div>
                  <button
                    onClick={() => user && toggle.mutate({
                      portfolioId: data.portfolio.id,
                      isPublic: !data.portfolio.is_public,
                      studentId: user.id,
                    })}
                    disabled={toggle.isPending}
                    className="relative w-11 h-6 rounded-full transition-colors focus:outline-none"
                    style={{ background: data.portfolio.is_public ? 'var(--accent)' : 'var(--hair)' }}>
                    <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform"
                      style={{ transform: data.portfolio.is_public ? 'translateX(20px)' : 'none' }} />
                  </button>
                </div>

                {/* Share link */}
                {shareUrl && (
                  <div>
                    <div className="text-[12.5px] font-medium ink-2 mb-1.5">Share link</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 hairline rounded-lg px-3 py-2 text-[12px] font-mono muted truncate bg-[var(--hair-2)]">
                        {shareUrl}
                      </div>
                      <button onClick={copyLink}
                        className="h-9 px-3 rounded-lg hairline text-[12.5px] font-semibold hover:bg-[var(--hair-2)] shrink-0 transition-colors"
                        style={{ color: copied ? 'var(--accent)' : 'var(--ink-2)' }}>
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Portfolio items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-semibold">Portfolio items</h2>
              <span className="text-[12px] muted">Auto-populated from completed work</span>
            </div>
            {!data?.portfolio ? (
              <EmptyState
                title="Create your portfolio first"
                description="Fill in your details on the left to get started."
              />
            ) : data.items.length === 0 ? (
              <EmptyState
                icon={<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></svg>}
                title="No items yet"
                description="Complete modules, get projects approved, and finish challenges — they'll appear here automatically."
              />
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {data.items.map(item => <PortfolioItemCard key={item.id} item={item} />)}
              </div>
            )}

            {/* Skills display */}
            {data?.portfolio?.skills && data.portfolio.skills.length > 0 && (
              <div className="mt-6 bg-surface hairline rounded-2xl shadow-card p-5">
                <h3 className="text-[14px] font-semibold mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.portfolio.skills.map(skill => (
                    <span key={skill} className="tag" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
