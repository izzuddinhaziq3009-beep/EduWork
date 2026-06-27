import { useState } from 'react'
import { useQuizDetail, useCreateQuiz, useUpdateQuiz } from '@/hooks/useQuiz'
import { useCreateQuizItem, useUpdateItemMeta } from '@/hooks/useModules'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { QuestionEditorCard } from './QuestionEditorCard'
import { newQuestion, questionToEditable, toQuestionInput } from './quizEditorTypes'
import type { EditableQuestion } from './quizEditorTypes'
import type { QuizDetail } from '@/services/quizService'
import type { QuestionType } from '@/types'

interface Props {
  moduleId: string
  itemId: string | null          // null = creating a brand new quiz item
  initialTitle?: string
  initialDescription?: string | null
  orderIndex?: number            // required when itemId is null
  onClose: () => void
}

const STEPS = ['Quiz info', 'Questions', 'Preview']

export function QuizEditorDialog({ moduleId, itemId, initialTitle, initialDescription, orderIndex, onClose }: Props) {
  const { data: quiz, isLoading } = useQuizDetail(itemId ?? '')

  return (
    <Dialog open onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{itemId ? 'Edit quiz' : 'Create quiz'}</DialogTitle></DialogHeader>
        {itemId && (isLoading || !quiz) ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
        ) : (
          <QuizEditorForm
            key={itemId ?? 'new'}
            moduleId={moduleId}
            itemId={itemId}
            initialTitle={initialTitle ?? ''}
            initialDescription={initialDescription ?? null}
            orderIndex={orderIndex ?? 0}
            quiz={quiz ?? null}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface FormProps {
  moduleId: string
  itemId: string | null
  initialTitle: string
  initialDescription: string | null
  orderIndex: number
  quiz: QuizDetail | null
  onClose: () => void
}

function QuizEditorForm({ moduleId, itemId, initialTitle, initialDescription, orderIndex, quiz, onClose }: FormProps) {
  const createQuizItem = useCreateQuizItem()
  const updateItemMeta = useUpdateItemMeta()
  const createQuiz = useCreateQuiz()
  const updateQuiz = useUpdateQuiz()

  const [step,            setStep]            = useState(1)
  const [title,           setTitle]           = useState(initialTitle)
  const [description,     setDescription]     = useState(initialDescription ?? '')
  const [passingScore,    setPassingScore]    = useState(quiz?.passing_score ?? 70)
  const [timeLimit,       setTimeLimit]       = useState(quiz?.time_limit_minutes != null ? String(quiz.time_limit_minutes) : '')
  const [shuffle,         setShuffle]         = useState(quiz?.shuffle_questions ?? false)
  const [showCorrect,     setShowCorrect]     = useState(quiz?.show_correct_answers ?? true)
  const [attemptsAllowed, setAttemptsAllowed] = useState(quiz ? String(quiz.attempts_allowed) : '1')
  const [questions,       setQuestions]       = useState<EditableQuestion[]>(() => quiz ? quiz.questions.map(questionToEditable) : [])

  const addQuestion    = (type: QuestionType) => setQuestions(prev => [...prev, newQuestion(type, prev.length)])
  const updateQuestion = (key: string, updated: EditableQuestion) => setQuestions(prev => prev.map(q => (q._key === key ? updated : q)))
  const removeQuestion = (key: string) => setQuestions(prev => prev.filter(q => q._key !== key))

  const step1Valid = title.trim().length > 0 && passingScore >= 0 && passingScore <= 100
  const step2Valid = questions.length > 0 && questions.every(q => {
    if (!q.question_text.trim()) return false
    if (q.type === 'short_answer') return q.answers.some(a => a.answer_text.trim().length > 0)
    return q.options.length > 0 && q.options.some(o => o.is_correct) && q.options.every(o => o.option_text.trim().length > 0)
  })

  const pending = createQuizItem.isPending || updateItemMeta.isPending || createQuiz.isPending || updateQuiz.isPending

  const handleSave = async () => {
    const quizData = {
      passing_score: passingScore,
      time_limit_minutes: timeLimit.trim() ? Number(timeLimit) : null,
      shuffle_questions: shuffle,
      show_correct_answers: showCorrect,
      attempts_allowed: Number(attemptsAllowed),
    }
    const questionInputs = questions.map(toQuestionInput)
    const itemData = { title: title.trim(), description: description.trim() || null }

    let targetItemId = itemId
    if (!targetItemId) {
      const item = await createQuizItem.mutateAsync({ moduleId, data: { ...itemData, order_index: orderIndex } })
      targetItemId = item.id
      await createQuiz.mutateAsync({ itemId: targetItemId, quizData, questions: questionInputs })
    } else {
      await updateItemMeta.mutateAsync({ itemId: targetItemId, moduleId, data: itemData })
      await updateQuiz.mutateAsync({ itemId: targetItemId, quizData, questions: questionInputs })
    }
    onClose()
  }

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex items-center">
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

      {step === 1 && (
        <div className="space-y-4">
          <div><label className="text-[12.5px] font-medium ink-2 block mb-1.5">Quiz title</label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
          <div><label className="text-[12.5px] font-medium ink-2 block mb-1.5">Description <span className="muted font-normal">(optional)</span></label><Textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[12.5px] font-medium ink-2 block mb-1.5">Passing score (%)</label>
              <Input type="number" min={0} max={100} value={passingScore} onChange={e => setPassingScore(Number(e.target.value))} />
            </div>
            <div><label className="text-[12.5px] font-medium ink-2 block mb-1.5">Time limit (minutes) <span className="muted font-normal">(optional)</span></label>
              <Input type="number" min={1} value={timeLimit} onChange={e => setTimeLimit(e.target.value)} placeholder="No limit" />
            </div>
          </div>
          <div><label className="text-[12.5px] font-medium ink-2 block mb-1.5">Attempts allowed</label>
            <Select value={attemptsAllowed} onValueChange={setAttemptsAllowed}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 attempt</SelectItem>
                <SelectItem value="2">2 attempts</SelectItem>
                <SelectItem value="3">3 attempts</SelectItem>
                <SelectItem value="-1">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2.5 text-[13px] ink-2 cursor-pointer">
            <input type="checkbox" checked={shuffle} onChange={e => setShuffle(e.target.checked)} className="w-4 h-4 accent-[var(--primary)]" />
            Shuffle question order for each attempt
          </label>
          <label className="flex items-center gap-2.5 text-[13px] ink-2 cursor-pointer">
            <input type="checkbox" checked={showCorrect} onChange={e => setShowCorrect(e.target.checked)} className="w-4 h-4 accent-[var(--primary)]" />
            Show correct answers in results after submission
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <QuestionEditorCard key={q._key} question={q} index={i}
              onChange={updated => updateQuestion(q._key, updated)}
              onRemove={() => removeQuestion(q._key)} />
          ))}
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => addQuestion('multiple_choice')}>+ Multiple choice</Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => addQuestion('true_false')}>+ True/False</Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => addQuestion('short_answer')}>+ Short answer</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <div className="hairline rounded-xl p-4" style={{ background: 'var(--hair-2)' }}>
            <div className="text-[15px] font-semibold">{title}</div>
            {description && <p className="text-[13px] muted mt-1">{description}</p>}
            <div className="flex items-center gap-3 mt-2 text-[12px] font-mono muted">
              <span>{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
              <span>·</span>
              <span>Pass at {passingScore}%</span>
              <span>·</span>
              <span>{attemptsAllowed === '-1' ? 'Unlimited attempts' : `${attemptsAllowed} attempt${attemptsAllowed === '1' ? '' : 's'}`}</span>
              {timeLimit && <><span>·</span><span>{timeLimit} min limit</span></>}
            </div>
          </div>
          {questions.map((q, i) => (
            <div key={q._key} className="hairline rounded-xl p-4">
              <div className="text-[11.5px] font-mono muted uppercase mb-2">Question {i + 1} ({q.points} pt{q.points !== 1 ? 's' : ''})</div>
              <p className="text-[14.5px] font-medium">{q.question_text || '(empty question)'}</p>
              {q.description && <p className="text-[13px] muted mt-1">{q.description}</p>}
              {q.type !== 'short_answer' ? (
                <ul className="mt-2 space-y-1">
                  {q.options.map(o => (
                    <li key={o._key} className="text-[13px] flex items-center gap-2" style={{ color: o.is_correct ? 'var(--accent)' : 'var(--ink-2)' }}>
                      {o.is_correct ? '✓' : '○'} {o.option_text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] muted mt-2">Accepted: {q.answers.map(a => a.answer_text).join(', ')}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        {step > 1 && <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>Back</Button>}
        {step < 3 ? (
          <Button className="flex-1" disabled={step === 1 ? !step1Valid : !step2Valid}
            style={{ background: 'var(--primary)', color: '#fff' }} onClick={() => setStep(s => s + 1)}>
            Next
          </Button>
        ) : (
          <Button className="flex-1" disabled={pending} style={{ background: 'var(--primary)', color: '#fff' }} onClick={handleSave}>
            {pending ? 'Saving…' : itemId ? 'Save changes' : 'Create quiz'}
          </Button>
        )}
        <Button variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  )
}
