import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ContentItemFormModal } from './ContentItemFormModal'
import { contentTypeIcon } from '../content/contentTypeIcon'
import type { EditableItem } from './editorTypes'
import type { SimpleContentAttachment } from '@/services/moduleService'

interface Props {
  text: string
  attachments: SimpleContentAttachment[]
  onTextChange: (text: string) => void
  onAttachmentsChange: (attachments: SimpleContentAttachment[]) => void
}

export function SimpleContentEditor({ text, attachments, onTextChange, onAttachmentsChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  const handleSave = (item: EditableItem) => {
    if (item.content_type === 'text') return
    onAttachmentsChange([...attachments, { type: item.content_type, title: item.title, url: item.file_url ?? '' }])
  }

  const removeAttachment = (idx: number) => {
    onAttachmentsChange(attachments.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[12.5px] font-medium ink-2 block mb-1.5">Content</label>
        <Textarea rows={8} value={text} onChange={e => onTextChange(e.target.value)} placeholder="Write the module content here…" />
      </div>

      <div className="space-y-2">
        <label className="text-[12.5px] font-medium ink-2 block mb-1.5">Attachments <span className="muted font-normal">(optional)</span></label>
        {attachments.length > 0 && (
          <div className="bg-surface hairline rounded-xl overflow-hidden">
            {attachments.map((a, i) => (
              <div key={`${a.url}-${i}`} className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-[var(--hair)] last:border-b-0">
                <span className="shrink-0" style={{ color: 'var(--primary)' }}>{contentTypeIcon(a.type)}</span>
                <span className="text-[13px] font-medium flex-1 truncate">{a.title}</span>
                <button onClick={() => removeAttachment(i)} className="text-[12px] font-semibold" style={{ color: 'var(--rose)' }}>Delete</button>
              </div>
            ))}
          </div>
        )}
        <Button type="button" variant="outline" className="w-full" onClick={() => setModalOpen(true)}>+ Upload video / PDF / image</Button>
      </div>

      {modalOpen && (
        <ContentItemFormModal
          initial={null}
          nextOrderIndex={0}
          allowedTypes={['video', 'pdf', 'image']}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
