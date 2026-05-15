interface Props { title: string; description?: string }

export function PlaceholderPage({ title, description }: Props) {
  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-6">
        <h1 className="font-display text-[32px] font-semibold tracking-tight">{title}</h1>
        {description && <p className="muted text-[15px] mt-2">{description}</p>}
      </div>
      <div className="bg-surface hairline rounded-2xl shadow-card p-10 text-center">
        <div className="w-12 h-12 rounded-2xl grid place-items-center mx-auto mb-4"
          style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/>
          </svg>
        </div>
        <h2 className="font-display text-[20px] font-semibold tracking-tight mb-2">{title}</h2>
        <p className="muted text-[14px] max-w-sm mx-auto leading-relaxed">
          This section is coming soon. Full content will be built in upcoming phases.
        </p>
      </div>
    </div>
  )
}
