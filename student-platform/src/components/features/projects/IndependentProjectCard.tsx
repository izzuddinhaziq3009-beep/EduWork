import { Link } from 'react-router-dom'
import { fmtRelative } from '@/utils/formatters'
import type { IndependentProject, IndependentProjectStatus } from '@/types'

const STATUS_CONFIG: Record<IndependentProjectStatus, { label: string; bg: string; color: string }> = {
  in_progress: { label: 'In Progress', bg: 'var(--warn-soft)',    color: 'var(--warn)'    },
  submitted:   { label: 'Submitted',   bg: 'var(--primary-soft)', color: 'var(--primary)' },
  completed:   { label: 'Completed',   bg: 'var(--accent-soft)',  color: 'var(--accent)'  },
}

interface Props {
  project: IndependentProject
  readonly?: boolean
  // Owner actions (student "My Projects" only — never shown when readonly)
  onSubmit?: () => void
  onComplete?: () => void
  onEdit?: () => void
  onDelete?: () => void
  // Company showcase action — renders a router Link to open a chat
  messageHref?: string
}

export function IndependentProjectCard({
  project, readonly, onSubmit, onComplete, onEdit, onDelete, messageHref,
}: Props) {
  const { label, bg, color } = STATUS_CONFIG[project.status]

  return (
    <div className="bg-surface hairline rounded-2xl shadow-card flex flex-col overflow-hidden">

      {/* Cover image / placeholder */}
      {project.image_url ? (
        <img src={project.image_url} alt={project.title} className="w-full h-[140px] object-cover" />
      ) : (
        <div className="w-full h-[140px] flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--hair-2) 0%, var(--hair) 100%)' }}>
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.4"
            strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
        </div>
      )}

      {/* Card body */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-semibold leading-snug">{project.title}</h3>
          <span className="tag shrink-0" style={{ background: bg, color }}>{label}</span>
        </div>

        {/* Author name — shown in showcase/readonly view */}
        {readonly && project.author_name && (
          <div className="text-[12px] muted flex items-center gap-1">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            <span>{project.author_name}</span>
          </div>
        )}

        <p className="text-[13px] muted leading-relaxed line-clamp-3">{project.description}</p>
        <div className="text-[11.5px] font-mono muted">{fmtRelative(project.created_at)}</div>

        {project.github_url && (
          <a href={project.github_url} target="_blank" rel="noopener noreferrer"
            className="text-[12.5px] font-medium flex items-center gap-1.5 hover:underline"
            style={{ color: 'var(--primary)' }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.14-1.1-1.44-1.1-1.44-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.9.83.1-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.9-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/>
            </svg>
            View on GitHub
          </a>
        )}

        {/* Student-only actions — hidden in readonly/showcase context */}
        {!readonly && project.status === 'in_progress' && onSubmit && (
          <button onClick={onSubmit}
            className="h-9 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90 mt-auto"
            style={{ background: 'var(--primary)' }}>
            Submit project
          </button>
        )}
        {!readonly && project.status === 'submitted' && onComplete && (
          <button onClick={onComplete}
            className="h-9 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90 mt-auto"
            style={{ background: 'var(--accent)' }}>
            Mark as complete
          </button>
        )}

        {!readonly && (onEdit || onDelete) && (
          <div className="flex gap-1 pt-2" style={{ borderTop: '1px solid var(--hair)' }}>
            {onEdit && (
              <button onClick={onEdit}
                className="flex-1 h-7 text-[12px] font-medium rounded-lg transition-colors hover:bg-[var(--hair-2)]"
                style={{ color: 'var(--ink-2)' }}>
                Edit
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete}
                className="flex-1 h-7 text-[12px] font-medium rounded-lg transition-colors"
                style={{ color: 'var(--rose)' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fff1f2')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                Delete
              </button>
            )}
          </div>
        )}

        {/* Company showcase action — router Link to open a chat with the author */}
        {messageHref && (
          <Link to={messageHref}
            className="h-9 rounded-xl text-[13px] font-semibold text-white flex items-center justify-center gap-2 mt-auto transition-opacity hover:opacity-90"
            style={{ background: 'var(--primary)' }}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a7 7 0 0 1-10.6 6l-4.4 1 1.1-4A7 7 0 1 1 21 12z"/>
            </svg>
            Message
          </Link>
        )}
      </div>
    </div>
  )
}
