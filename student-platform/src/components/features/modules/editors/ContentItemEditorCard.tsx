import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ContentItemFormModal } from './ContentItemFormModal'
import { contentTypeIcon } from '../content/contentTypeIcon'
import { useCreateContentItem, useUpdateContentItem } from '@/hooks/useModules'
import { pieceToEditable, toContentPieceInput } from './editorTypes'
import type { EditableItem } from './editorTypes'
import type { ModuleItemWithContent } from '@/services/moduleService'

interface Props {
  moduleId: string
  item: ModuleItemWithContent | null // null = creating a brand new content item
  orderIndex: number
  onClose: () => void
}

export function ContentItemEditorCard({ moduleId, item, orderIndex, onClose }: Props) {
  const createItem = useCreateContentItem()
  const updateItem = useUpdateContentItem()

  const [title,       setTitle]       = useState(item?.title ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [pieces,       setPieces]     = useState<EditableItem[]>(() => (item?.pieces ?? []).map(pieceToEditable))
  const [modalOpen,    setModalOpen]  = useState(false)
  const [editingPiece, setEditingPiece] = useState<EditableItem | null>(null)

  const openAdd  = () => { setEditingPiece(null); setModalOpen(true) }
  const openEdit = (p: EditableItem) => { setEditingPiece(p); setModalOpen(true) }
  const savePiece = (p: EditableItem) => {
    const exists = pieces.some(x => x._key === p._key)
    setPieces(exists ? pieces.map(x => (x._key === p._key ? p : x)) : [...pieces, p])
  }
  const removePiece = (key: string) => setPieces(pieces.filter(p => p._key !== key))

  const valid = title.trim().length > 0
  const pending = createItem.isPending || updateItem.isPending

  const handleSave = () => {
    const pieceInputs = pieces.map(toContentPieceInput)
    const data = { title: title.trim(), description: description.trim() || null }
    if (item) {
      updateItem.mutate({ itemId: item.id, moduleId, data, pieces: pieceInputs }, { onSuccess: onClose })
    } else {
      createItem.mutate({ moduleId, data: { ...data, order_index: orderIndex }, pieces: pieceInputs }, { onSuccess: onClose })
    }
  }

  return (
    <div className="hairline rounded-2xl p-5 space-y-4" style={{ background: '#FBFAF5' }}>
      <div><label className="text-[12.5px] font-medium ink-2 block mb-1.5">Item title</label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Introduction" /></div>
      <div><label className="text-[12.5px] font-medium ink-2 block mb-1.5">Description <span className="muted font-normal">(optional)</span></label><Textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} /></div>

      <div className="space-y-2">
        {pieces.length > 0 && (
          <div className="bg-surface hairline rounded-xl overflow-hidden">
            {pieces.map(p => (
              <div key={p._key} className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-[var(--hair)] last:border-b-0">
                <span className="shrink-0" style={{ color: 'var(--primary)' }}>{contentTypeIcon(p.content_type)}</span>
                <span className="text-[13px] font-medium flex-1 truncate">{p.title || '(untitled)'}</span>
                <button onClick={() => openEdit(p)} className="text-[12px] font-semibold ink-2 hover:underline">Edit</button>
                <button onClick={() => removePiece(p._key)} className="text-[12px] font-semibold" style={{ color: 'var(--rose)' }}>Delete</button>
              </div>
            ))}
          </div>
        )}
        <Button type="button" variant="outline" className="w-full" onClick={openAdd}>+ Add content piece</Button>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button className="flex-1" disabled={!valid || pending} style={{ background: 'var(--primary)', color: '#fff' }} onClick={handleSave}>
          {pending ? 'Saving…' : item ? 'Save item' : 'Add item'}
        </Button>
      </div>

      {modalOpen && (
        <ContentItemFormModal
          key={editingPiece?._key ?? 'new'}
          initial={editingPiece}
          nextOrderIndex={pieces.length}
          onClose={() => setModalOpen(false)}
          onSave={savePiece}
        />
      )}
    </div>
  )
}
