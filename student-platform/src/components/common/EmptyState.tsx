interface Props {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="w-14 h-14 rounded-2xl grid place-items-center mb-4"
          style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
          {icon}
        </div>
      )}
      <h3 className="font-display text-[20px] font-semibold tracking-tight">{title}</h3>
      {description && <p className="muted text-[14px] mt-2 max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
