import type { PortfolioItem, PortfolioItemType } from '@/types'

const TYPE_CONFIG: Record<PortfolioItemType, { label: string; icon: string; bg: string; color: string }> = {
  module:              { label: 'Module',          icon: '📚', bg: 'var(--primary-soft)', color: 'var(--primary)' },
  project:             { label: 'Project',         icon: '📁', bg: 'var(--accent-soft)',  color: 'var(--accent)'  },
  challenge:           { label: 'Challenge',       icon: '🏆', bg: 'var(--warn-soft)',    color: 'var(--warn)'    },
  independent_project: { label: 'Indie Project',  icon: '⚡', bg: 'var(--rose-soft)',    color: 'var(--rose)'    },
}

export function PortfolioItemCard({ item }: { item: PortfolioItem }) {
  const { label, icon, bg, color } = TYPE_CONFIG[item.type]
  return (
    <div className="bg-surface hairline rounded-2xl p-4 flex items-start gap-3 hover:shadow-card transition-shadow">
      <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0 text-lg"
        style={{ background: bg }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="tag text-[10px] font-mono" style={{ background: bg, color }}>{label}</span>
        </div>
        <h4 className="text-[14px] font-semibold leading-tight truncate">{item.title}</h4>
        <p className="text-[12.5px] muted mt-0.5 line-clamp-2">{item.description}</p>
      </div>
    </div>
  )
}
