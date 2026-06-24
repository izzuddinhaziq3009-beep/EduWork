import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useCreateModule } from '@/hooks/useModules'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SimpleContentEditor } from '@/components/features/modules/editors/SimpleContentEditor'
import { ModuleItemsManager } from '@/components/features/modules/editors/ModuleItemsManager'
import type { SimpleContentAttachment } from '@/services/moduleService'
import type { DifficultyLevel, ModuleType } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
}

const STEPS = ['Basic info', 'Module type', 'Content']

export function CreateModuleDialog({ open, onClose }: Props) {
  const { user } = useAuthStore()
  const createModule = useCreateModule()

  const [step,            setStep]            = useState(1)
  const [title,           setTitle]           = useState('')
  const [description,     setDescription]     = useState('')
  const [difficulty,      setDifficulty]      = useState<DifficultyLevel>('beginner')
  const [duration,        setDuration]        = useState(1)
  const [moduleType,      setModuleType]      = useState<ModuleType>('simple')
  const [simpleText,      setSimpleText]      = useState('')
  const [attachments,     setAttachments]     = useState<SimpleContentAttachment[]>([])
  const [createdModuleId, setCreatedModuleId] = useState<string | null>(null)

  const reset = () => {
    setStep(1); setTitle(''); setDescription(''); setDifficulty('beginner'); setDuration(1)
    setModuleType('simple'); setSimpleText(''); setAttachments([]); setCreatedModuleId(null)
  }
  const handleClose = () => { reset(); onClose() }

  const step1Valid = title.trim().length > 0 && description.trim().length > 0 && duration > 0
  const step3SimpleValid = simpleText.trim().length > 0

  // Structured modules need a real DB id before items (especially quizzes) can be attached,
  // so the bare module is created the moment the admin leaves the "module type" step.
  const handleNext = () => {
    if (step === 2 && moduleType === 'structured' && !createdModuleId) {
      if (!user) return
      const moduleData = { title: title.trim(), description: description.trim(), difficulty_level: difficulty, duration_hours: duration }
      createModule.mutate({ type: 'structured', adminId: user.id, moduleData }, {
        onSuccess: m => { setCreatedModuleId(m.id); setStep(3) },
      })
      return
    }
    setStep(s => s + 1)
  }

  const handleCreateSimple = () => {
    if (!user) return
    const moduleData = { title: title.trim(), description: description.trim(), difficulty_level: difficulty, duration_hours: duration }
    createModule.mutate(
      { type: 'simple', adminId: user.id, moduleData, simpleContent: { text: simpleText, attachments } },
      { onSuccess: handleClose },
    )
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Create module — {STEPS[step - 1]}</DialogTitle></DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center mb-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="w-6 h-6 rounded-full grid place-items-center text-[11px] font-bold shrink-0"
                style={{ background: step > i + 1 ? 'var(--accent)' : step === i + 1 ? 'var(--primary)' : 'var(--hair-2)', color: step >= i + 1 ? '#fff' : 'var(--muted)' }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className="flex-1 h-px mx-1" style={{ background: 'var(--hair)' }} />}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {step === 1 && (
            <>
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
            </>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-3">
              <button type="button" disabled={!!createdModuleId} onClick={() => setModuleType('simple')}
                className="text-left p-4 rounded-2xl hairline transition-colors disabled:opacity-50"
                style={{ borderColor: moduleType === 'simple' ? 'var(--primary)' : undefined, background: moduleType === 'simple' ? 'var(--primary-soft)' : 'var(--surface)' }}>
                <div className="text-[14px] font-semibold mb-1">{moduleType === 'simple' ? '●' : '○'} Simple Module</div>
                <div className="text-[12.5px] muted leading-relaxed">Single content area. Good for short topics.</div>
              </button>
              <button type="button" disabled={!!createdModuleId} onClick={() => setModuleType('structured')}
                className="text-left p-4 rounded-2xl hairline transition-colors disabled:opacity-50"
                style={{ borderColor: moduleType === 'structured' ? 'var(--primary)' : undefined, background: moduleType === 'structured' ? 'var(--primary-soft)' : 'var(--surface)' }}>
                <div className="text-[14px] font-semibold mb-1">{moduleType === 'structured' ? '●' : '○'} Structured Module</div>
                <div className="text-[12.5px] muted leading-relaxed">A flat, reorderable list of content items and quizzes — e.g. content, then a quiz, then more content.</div>
              </button>
            </div>
          )}

          {step === 3 && moduleType === 'simple' && (
            <SimpleContentEditor text={simpleText} attachments={attachments} onTextChange={setSimpleText} onAttachmentsChange={setAttachments} />
          )}

          {step === 3 && moduleType === 'structured' && createdModuleId && (
            <ModuleItemsManager moduleId={createdModuleId} />
          )}

          <div className="flex gap-2 pt-2">
            {step > 1 && step !== 3 && <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>Back</Button>}
            {step < 3 ? (
              <Button className="flex-1" disabled={(step === 1 && !step1Valid) || createModule.isPending}
                style={{ background: 'var(--primary)', color: '#fff' }} onClick={handleNext}>
                {createModule.isPending ? 'Creating…' : 'Next'}
              </Button>
            ) : moduleType === 'simple' ? (
              <Button className="flex-1" disabled={!step3SimpleValid || createModule.isPending} style={{ background: 'var(--primary)', color: '#fff' }} onClick={handleCreateSimple}>
                {createModule.isPending ? 'Creating…' : 'Create module'}
              </Button>
            ) : (
              <Button className="flex-1" style={{ background: 'var(--primary)', color: '#fff' }} onClick={handleClose}>
                Done
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
