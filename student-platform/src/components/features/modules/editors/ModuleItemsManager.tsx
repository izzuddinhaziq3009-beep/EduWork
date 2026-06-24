import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useModuleDetail, useDeleteItem, useReorderItems } from '@/hooks/useModules'
import { ContentItemEditorCard } from './ContentItemEditorCard'
import { QuizEditorDialog } from './QuizEditorDialog'

interface Props {
  moduleId: string
}

export function ModuleItemsManager({ moduleId }: Props) {
  const { data: module, isLoading } = useModuleDetail(moduleId)
  const deleteItemMut = useDeleteItem()
  const reorder = useReorderItems()

  const [expandedId, setExpandedId]   = useState<string | null>(null)
  const [creatingContent, setCreatingContent] = useState(false)
  const [quizEditor, setQuizEditor]   = useState<{ itemId: string | null; title: string; description: string | null; orderIndex: number } | null>(null)
  const [delId, setDelId] = useState<string | null>(null)

  if (isLoading || !module) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
  }

  const items = module.items

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir
    if (target < 0 || target >= items.length) return
    const ids = items.map(i => i.id)
    const tmp = ids[idx]; ids[idx] = ids[target]; ids[target] = tmp
    reorder.mutate({ moduleId, orderedItemIds: ids })
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && !creatingContent && (
        <p className="text-[13px] muted">No items yet. Add your first content item or quiz below.</p>
      )}

      {items.map((item, idx) => (
        expandedId === item.id ? (
          <ContentItemEditorCard key={item.id} moduleId={moduleId} item={item} orderIndex={item.order_index} onClose={() => setExpandedId(null)} />
        ) : (
          <div key={item.id} className="hairline rounded-xl px-4 py-3 flex items-center gap-3 bg-surface">
            <span className="text-[11px] font-mono muted shrink-0">{idx + 1}</span>
            <span className="tag shrink-0" style={{ background: item.type === 'quiz' ? 'var(--primary-soft)' : 'var(--accent-soft)', color: item.type === 'quiz' ? 'var(--primary)' : 'var(--accent)' }}>
              {item.type === 'quiz' ? 'Quiz' : 'Content'}
            </span>
            <span className="text-[13.5px] font-medium flex-1 truncate">{item.title}</span>
            {item.type === 'content' && (
              <span className="text-[11.5px] muted shrink-0">{item.pieces.length} piece{item.pieces.length !== 1 ? 's' : ''}</span>
            )}
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => move(idx, -1)} disabled={idx === 0}
                className="w-7 h-7 rounded-lg hairline hover:bg-[var(--hair-2)] disabled:opacity-30 grid place-items-center text-[12px]">↑</button>
              <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1}
                className="w-7 h-7 rounded-lg hairline hover:bg-[var(--hair-2)] disabled:opacity-30 grid place-items-center text-[12px]">↓</button>
              <button
                onClick={() => (item.type === 'quiz'
                  ? setQuizEditor({ itemId: item.id, title: item.title, description: item.description, orderIndex: item.order_index })
                  : setExpandedId(item.id))}
                className="h-7 px-2.5 rounded-lg text-[12px] font-semibold hairline hover:bg-[var(--hair-2)] ink-2">
                Edit
              </button>
              <button onClick={() => setDelId(item.id)}
                className="h-7 px-2.5 rounded-lg text-[12px] font-semibold hairline hover:bg-[var(--rose-soft)]" style={{ color: 'var(--rose)' }}>
                Delete
              </button>
            </div>
          </div>
        )
      ))}

      {creatingContent && (
        <ContentItemEditorCard moduleId={moduleId} item={null} orderIndex={items.length} onClose={() => setCreatingContent(false)} />
      )}

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => setCreatingContent(true)}>+ Add content item</Button>
        <Button type="button" variant="outline" className="flex-1"
          onClick={() => setQuizEditor({ itemId: null, title: '', description: null, orderIndex: items.length })}>
          + Add quiz item
        </Button>
      </div>

      {quizEditor && (
        <QuizEditorDialog
          moduleId={moduleId}
          itemId={quizEditor.itemId}
          initialTitle={quizEditor.title}
          initialDescription={quizEditor.description}
          orderIndex={quizEditor.orderIndex}
          onClose={() => setQuizEditor(null)}
        />
      )}

      <Dialog open={!!delId} onOpenChange={v => !v && setDelId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete item?</DialogTitle></DialogHeader>
          <p className="text-[13.5px] ink-2">This deletes the item and all of its content or quiz data. This cannot be undone.</p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDelId(null)}>Cancel</Button>
            <Button disabled={deleteItemMut.isPending} className="flex-1" style={{ background: 'var(--rose)', color: '#fff' }}
              onClick={() => { if (delId) deleteItemMut.mutate({ itemId: delId, moduleId }, { onSuccess: () => setDelId(null) }) }}>
              {deleteItemMut.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
