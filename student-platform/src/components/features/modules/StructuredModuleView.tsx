import { useState } from 'react'
import { useItemProgress, useMarkItemComplete } from '@/hooks/useModules'
import { ContentItemRenderer } from './content/ContentItemRenderer'
import { ItemQuizBlock } from './quiz/ItemQuizBlock'
import type { ModuleWithItems } from '@/services/moduleService'

interface Props {
  module: ModuleWithItems
  studentId: string
}

export function StructuredModuleView({ module, studentId }: Props) {
  const items = module.items
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')
  const { data: progress = [] } = useItemProgress(studentId, module.id)
  const markComplete = useMarkItemComplete()

  const activeIndex = items.findIndex(i => i.id === activeId)
  const activeItem = items[activeIndex] ?? items[0]

  if (items.length === 0 || !activeItem) {
    return <p className="text-[14px] muted">This module has no items yet.</p>
  }

  const completedSet  = new Set(progress.filter(p => p.is_completed).map(p => p.item_id))
  const quizPassedSet = new Set(progress.filter(p => p.quiz_passed).map(p => p.item_id))
  const overallPct = Math.round((completedSet.size / items.length) * 100)

  const goTo = (idx: number) => { if (idx >= 0 && idx < items.length) setActiveId(items[idx].id) }

  const toggleComplete = () => {
    markComplete.mutate({ moduleId: module.id, itemId: activeItem.id, studentId, completed: !completedSet.has(activeItem.id) })
  }

  return (
    <div className="grid md:grid-cols-[260px_1fr] gap-6">
      {/* Sidebar */}
      <aside className="space-y-1">
        {items.map((it, i) => {
          const done = completedSet.has(it.id)
          const active = it.id === activeItem.id
          return (
            <button key={it.id} onClick={() => setActiveId(it.id)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 transition-colors ${active ? 'bg-[var(--primary-soft)]' : 'hover:bg-[var(--hair-2)]'}`}>
              <span className="w-5 h-5 rounded-full grid place-items-center text-[10px] font-bold shrink-0"
                style={{ background: done ? 'var(--accent)' : 'var(--hair-2)', color: done ? '#fff' : 'var(--muted)' }}>
                {done ? '✓' : i + 1}
              </span>
              <span className={`text-[13.5px] truncate flex-1 ${active ? 'font-semibold' : 'font-medium ink-2'}`}>{it.title}</span>
              {it.type === 'quiz' && (
                <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded shrink-0" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>QUIZ</span>
              )}
            </button>
          )
        })}
        <div className="px-3.5 pt-3 mt-2 hairline-t">
          <div className="flex items-center justify-between text-[12px] mb-1.5">
            <span className="muted">Overall</span>
            <span className="font-mono font-semibold">{overallPct}%</span>
          </div>
          <div className="pbar teal" style={{ height: 6 }}><span style={{ width: `${overallPct}%` }} /></div>
        </div>
      </aside>

      {/* Content panel */}
      <div className="space-y-6 min-w-0">
        <div>
          <h2 className="font-display text-[20px] font-semibold tracking-tight">{activeItem.title}</h2>
          {activeItem.description && <p className="text-[13.5px] muted mt-1.5">{activeItem.description}</p>}
        </div>

        {activeItem.type === 'content' ? (
          activeItem.pieces.length === 0 ? (
            <p className="text-[14px] muted">No content in this item yet.</p>
          ) : (
            <div className="space-y-8">
              {activeItem.pieces.map(piece => <ContentItemRenderer key={piece.id} item={piece} />)}
            </div>
          )
        ) : (
          <ItemQuizBlock key={activeItem.id} itemId={activeItem.id} moduleId={module.id} studentId={studentId} quizPassed={quizPassedSet.has(activeItem.id)} />
        )}

        <div className="flex items-center justify-between gap-3 pt-4 hairline-t">
          <button onClick={() => goTo(activeIndex - 1)} disabled={activeIndex === 0}
            className="h-9 px-3.5 rounded-lg text-[13px] font-semibold hairline hover:bg-[var(--hair-2)] disabled:opacity-40 transition-colors">
            ← Previous
          </button>
          {activeItem.type === 'content' ? (
            <button onClick={toggleComplete} disabled={markComplete.isPending}
              className="h-9 px-4 rounded-lg text-[13px] font-semibold text-white disabled:opacity-70 transition-opacity"
              style={{ background: completedSet.has(activeItem.id) ? 'var(--muted)' : 'var(--accent)' }}>
              {completedSet.has(activeItem.id) ? '✓ Completed — undo' : 'Mark as read'}
            </button>
          ) : (
            <span className="text-[12.5px] muted">
              {quizPassedSet.has(activeItem.id) ? '✓ Item complete' : 'Pass the quiz above to complete this item'}
            </span>
          )}
          <button onClick={() => goTo(activeIndex + 1)} disabled={activeIndex === items.length - 1}
            className="h-9 px-3.5 rounded-lg text-[13px] font-semibold hairline hover:bg-[var(--hair-2)] disabled:opacity-40 transition-colors">
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
