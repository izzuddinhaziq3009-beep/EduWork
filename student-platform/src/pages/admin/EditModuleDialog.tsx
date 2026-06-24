import { useState } from 'react'
import { useModuleDetail, useUpdateModule } from '@/hooks/useModules'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { SimpleContentEditor } from '@/components/features/modules/editors/SimpleContentEditor'
import { ModuleItemsManager } from '@/components/features/modules/editors/ModuleItemsManager'
import { parseSimpleContent } from '@/services/moduleService'
import type { ModuleWithItems, SimpleContentAttachment } from '@/services/moduleService'
import type { DifficultyLevel } from '@/types'

interface Props {
  moduleId: string | null
  onClose: () => void
}

export function EditModuleDialog({ moduleId, onClose }: Props) {
  const { data: module, isLoading } = useModuleDetail(moduleId ?? '')

  return (
    <Dialog open={!!moduleId} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit module</DialogTitle></DialogHeader>
        {isLoading || !module ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
        ) : (
          <EditModuleForm key={module.id} module={module} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function EditModuleForm({ module, onClose }: { module: ModuleWithItems; onClose: () => void }) {
  const updateModule = useUpdateModule()

  const [title,       setTitle]       = useState(module.title)
  const [description, setDescription] = useState(module.description)
  const [difficulty,  setDifficulty]  = useState<DifficultyLevel>(module.difficulty_level)
  const [duration,    setDuration]    = useState(module.duration_hours)

  const initialSimple = module.module_type === 'simple' ? parseSimpleContent(module.simple_content) : null
  const [simpleText,  setSimpleText]  = useState(initialSimple?.text ?? '')
  const [attachments, setAttachments] = useState<SimpleContentAttachment[]>(initialSimple?.attachments ?? [])

  const valid = title.trim().length > 0 && description.trim().length > 0 && duration > 0 &&
    (module.module_type === 'simple' ? simpleText.trim().length > 0 : true)

  const handleSaveBasicInfo = () => {
    const moduleData = { title: title.trim(), description: description.trim(), difficulty_level: difficulty, duration_hours: duration }
    if (module.module_type === 'simple') {
      updateModule.mutate(
        { type: 'simple', moduleId: module.id, moduleData, simpleContent: { text: simpleText, attachments } },
        { onSuccess: onClose },
      )
    } else {
      updateModule.mutate({ type: 'structured', moduleId: module.id, moduleData }, { onSuccess: onClose })
    }
  }

  return (
    <div className="space-y-4">
      <span className="tag inline-flex" style={{ background: 'var(--hair-2)', color: 'var(--ink-2)' }}>
        {module.module_type === 'simple' ? 'Simple module' : 'Structured module'} — type can't be changed
      </span>

      <div><label className="text-[12.5px] font-medium ink-2 block mb-1.5">Title</label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
      <div><label className="text-[12.5px] font-medium ink-2 block mb-1.5">Description</label><Textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-[12.5px] font-medium ink-2 block mb-1.5">Difficulty</label>
          <Select value={difficulty} onValueChange={v => setDifficulty(v as DifficultyLevel)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><label className="text-[12.5px] font-medium ink-2 block mb-1.5">Duration (hours)</label>
          <Input type="number" min={1} value={duration} onChange={e => setDuration(Number(e.target.value))} />
        </div>
      </div>

      {module.module_type === 'simple' ? (
        <>
          <SimpleContentEditor text={simpleText} attachments={attachments} onTextChange={setSimpleText} onAttachmentsChange={setAttachments} />
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" disabled={!valid || updateModule.isPending} style={{ background: 'var(--primary)', color: '#fff' }} onClick={handleSaveBasicInfo}>
              {updateModule.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex gap-2 pt-1">
            <Button className="flex-1" disabled={!valid || updateModule.isPending} variant="outline" onClick={handleSaveBasicInfo}>
              {updateModule.isPending ? 'Saving…' : 'Save title / description / difficulty'}
            </Button>
          </div>
          <div className="pt-2 hairline-t">
            <div className="text-[12px] font-mono tracking-wide muted uppercase mt-4 mb-3">Items</div>
            <ModuleItemsManager moduleId={module.id} />
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={onClose} style={{ background: 'var(--primary)', color: '#fff' }}>Done</Button>
          </div>
        </>
      )}
    </div>
  )
}
