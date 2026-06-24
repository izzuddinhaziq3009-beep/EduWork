interface Props {
  url: string
  title: string
}

export function PDFContent({ url, title }: Props) {
  if (!url) return null
  return (
    <div className="rounded-2xl overflow-hidden hairline">
      <iframe src={url} className="w-full block" style={{ height: 480, background: 'var(--hair-2)' }} title={title} />
      <div className="px-4 py-2.5 hairline-t flex items-center justify-between bg-surface">
        <span className="text-[12.5px] muted truncate flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
          {title}
        </span>
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="text-[12.5px] font-semibold shrink-0" style={{ color: 'var(--primary)' }}>
          Open / Download →
        </a>
      </div>
    </div>
  )
}
