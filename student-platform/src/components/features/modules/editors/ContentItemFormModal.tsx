import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { TextContentEditor } from './TextContentEditor'
import { VideoContentEditor } from './VideoContentEditor'
import { PDFContentEditor } from './PDFContentEditor'
import { ImageContentEditor } from './ImageContentEditor'
import type { EditableItem } from './editorTypes'
import type { ContentItemType } from '@/types'

const TYPES: { value: ContentItemType; label: string }[] = [
  { value: 'text',  label: 'Text'  },
  { value: 'video', label: 'Video' },
  { value: 'pdf',   label: 'PDF'   },
  { value: 'image', label: 'Image' },
]

interface Props {
  initial: EditableItem | null
  nextOrderIndex: number
  allowedTypes?: ContentItemType[]
  onClose: () => void
  onSave: (item: EditableItem) => void
}

// Caller must only mount this when the modal should be open, and pass a `key`
// that changes between "add new" / "edit item X" so this re-initializes cleanly.
export function ContentItemFormModal({ initial, nextOrderIndex, allowedTypes, onClose, onSave }: Props) {
  const types = allowedTypes ? TYPES.filter(t => allowedTypes.includes(t.value)) : TYPES
  const [type, setType] = useState<ContentItemType>(initial?.content_type ?? types[0].value)
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [content, setContent] = useState(initial?.content_text ?? '')
  const [fileUrl, setFileUrl] = useState(initial?.file_url ?? '')

  const valid = title.trim().length > 0 && (type === 'text' ? content.trim().length > 0 : fileUrl.trim().length > 0)

  const handleSave = () => {
    if (!valid) return
    onSave({
      _key: initial?._key ?? crypto.randomUUID(),
      id: initial?.id,
      content_type: type,
      title: title.trim(),
      description: description.trim() || null,
      content_text: type === 'text' ? content : null,
      file_url: type !== 'text' ? fileUrl : null,
      order_index: initial?.order_index ?? nextOrderIndex,
    })
    onClose()
  }

  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{initial ? 'Edit content' : 'Add content'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-[12.5px] font-medium ink-2 block mb-1.5">Content type</label>
            <div className="hairline rounded-xl p-1 flex bg-[var(--hair-2)] w-fit">
              {types.map(t => (
                <button key={t.value} onClick={() => setType(t.value)}
                  className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors ${type === t.value ? 'bg-[var(--surface)] shadow-card ink' : 'muted hover:text-[color:var(--ink)]'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[12.5px] font-medium ink-2 block mb-1.5">Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Introduction" />
          </div>
          <div>
            <label className="text-[12.5px] font-medium ink-2 block mb-1.5">Description <span className="muted font-normal">(optional)</span></label>
            <Textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          {type === 'text'  && <TextContentEditor  value={content} onChange={setContent} />}
          {type === 'video' && <VideoContentEditor value={fileUrl} onChange={setFileUrl} />}
          {type === 'pdf'   && <PDFContentEditor   value={fileUrl} onChange={setFileUrl} />}
          {type === 'image' && <ImageContentEditor value={fileUrl} onChange={setFileUrl} />}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" disabled={!valid} style={{ background: 'var(--primary)', color: '#fff' }} onClick={handleSave}>
              Save content
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
