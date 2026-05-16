import React from 'react'

interface Props {
  label?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ label, title, description, action }: Props) {
  return (
    <div className="flex items-end justify-between mb-7 gap-4">
      <div>
        {label && (
          <div className="font-mono text-[11px] tracking-[0.18em] muted uppercase mb-1">{label}</div>
        )}
        <h1 className="font-display text-[34px] font-semibold tracking-tight leading-[1.1]">{title}</h1>
        {description && <p className="muted text-[15px] mt-1.5 max-w-[600px]">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
