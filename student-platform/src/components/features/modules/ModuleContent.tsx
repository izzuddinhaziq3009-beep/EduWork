interface ContentSection {
  type: 'text' | 'code' | 'video'
  title?: string
  content?: string
  language?: string
  url?: string
}

interface Props {
  content: Record<string, unknown>
}

export function ModuleContent({ content }: Props) {
  const sections = (content?.sections ?? []) as ContentSection[]

  if (sections.length === 0) {
    return (
      <div className="prose max-w-none">
        <p className="text-[15px] leading-relaxed ink-2">
          {(content?.overview as string) ?? 'Module content will appear here once the instructor adds it.'}
        </p>
        {(content?.objectives as string[])?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-[16px] font-semibold mb-3">Learning objectives</h3>
            <ul className="space-y-2">
              {(content.objectives as string[]).map((obj, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[14px] ink-2">
                  <span className="w-5 h-5 rounded-full grid place-items-center shrink-0 mt-0.5"
                    style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5l4.5 4.5L19 7" />
                    </svg>
                  </span>
                  {obj}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {sections.map((sec, i) => {
        if (sec.type === 'text') return (
          <div key={i}>
            {sec.title && <h3 className="text-[17px] font-semibold mb-3">{sec.title}</h3>}
            <p className="text-[15px] leading-relaxed ink-2">{sec.content}</p>
          </div>
        )
        if (sec.type === 'code') return (
          <div key={i}>
            {sec.title && <h3 className="text-[17px] font-semibold mb-3">{sec.title}</h3>}
            <div className="rounded-xl overflow-hidden hairline">
              <div className="px-4 py-2 flex items-center justify-between hairline-b"
                style={{ background: 'var(--ink)', color: 'var(--muted)' }}>
                <span className="font-mono text-[11px]">{sec.language ?? 'code'}</span>
              </div>
              <pre className="p-4 text-[13px] leading-relaxed overflow-x-auto font-mono"
                style={{ background: '#1a1d23', color: '#e1e4e8' }}>
                <code>{sec.content}</code>
              </pre>
            </div>
          </div>
        )
        if (sec.type === 'video') return (
          <div key={i}>
            {sec.title && <h3 className="text-[17px] font-semibold mb-3">{sec.title}</h3>}
            <div className="rounded-2xl overflow-hidden hairline aspect-video flex items-center justify-center"
              style={{ background: 'var(--hair-2)' }}>
              <p className="muted text-[14px]">Video content</p>
            </div>
          </div>
        )
        return null
      })}
    </div>
  )
}
