import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { newOption, newAnswer } from './quizEditorTypes'
import type { EditableQuestion } from './quizEditorTypes'

const TYPE_LABEL: Record<EditableQuestion['type'], string> = {
  multiple_choice: 'Multiple choice',
  true_false:      'True/False',
  short_answer:    'Short answer',
}

interface Props {
  question: EditableQuestion
  index: number
  onChange: (question: EditableQuestion) => void
  onRemove: () => void
}

export function QuestionEditorCard({ question, index, onChange, onRemove }: Props) {
  const setCorrectOption = (key: string) => {
    onChange({ ...question, options: question.options.map(o => ({ ...o, is_correct: o._key === key })) })
  }
  const updateOption = (key: string, text: string) => {
    onChange({ ...question, options: question.options.map(o => (o._key === key ? { ...o, option_text: text } : o)) })
  }
  const addOption    = () => onChange({ ...question, options: [...question.options, newOption(question.options.length)] })
  const removeOption = (key: string) => onChange({ ...question, options: question.options.filter(o => o._key !== key) })

  const updateAnswer = (key: string, text: string) => {
    onChange({ ...question, answers: question.answers.map(a => (a._key === key ? { ...a, answer_text: text } : a)) })
  }
  const addAnswer    = () => onChange({ ...question, answers: [...question.answers, newAnswer()] })
  const removeAnswer = (key: string) => onChange({ ...question, answers: question.answers.filter(a => a._key !== key) })

  return (
    <div className="hairline rounded-xl p-4 space-y-3 bg-surface">
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] font-mono tracking-wide muted uppercase">
          Question {index + 1} · {TYPE_LABEL[question.type]}
        </span>
        <button onClick={onRemove} className="text-[12px] font-semibold" style={{ color: 'var(--rose)' }}>Delete</button>
      </div>

      <Textarea rows={2} value={question.question_text}
        onChange={e => onChange({ ...question, question_text: e.target.value })}
        placeholder="Question text" />
      <Textarea rows={1} value={question.description ?? ''}
        onChange={e => onChange({ ...question, description: e.target.value })}
        placeholder="Description (optional)" />
      <div className="flex items-center gap-2">
        <label className="text-[12px] muted">Points</label>
        <Input type="number" min={1} value={question.points}
          onChange={e => onChange({ ...question, points: Number(e.target.value) })}
          className="w-20 h-8" />
      </div>

      {(question.type === 'multiple_choice' || question.type === 'true_false') && (
        <div className="space-y-2">
          <label className="text-[12px] muted block">Click the circle to mark the correct answer</label>
          {question.options.map(o => (
            <div key={o._key} className="flex items-center gap-2">
              <button type="button" onClick={() => setCorrectOption(o._key)}
                className="w-5 h-5 rounded-full shrink-0 grid place-items-center hairline transition-colors"
                style={{ background: o.is_correct ? 'var(--accent)' : 'transparent' }}
                title="Mark as correct answer">
                {o.is_correct && (
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>
                )}
              </button>
              <Input value={o.option_text} onChange={e => updateOption(o._key, e.target.value)}
                disabled={question.type === 'true_false'} className="flex-1 h-8" />
              {question.type === 'multiple_choice' && question.options.length > 2 && (
                <button onClick={() => removeOption(o._key)} className="text-[13px] font-semibold shrink-0" style={{ color: 'var(--rose)' }}>✕</button>
              )}
            </div>
          ))}
          {question.type === 'multiple_choice' && (
            <Button type="button" variant="outline" size="sm" onClick={addOption}>+ Add option</Button>
          )}
        </div>
      )}

      {question.type === 'short_answer' && (
        <div className="space-y-2">
          <label className="text-[12px] muted block">Accepted answers (matched case-insensitively)</label>
          {question.answers.map(a => (
            <div key={a._key} className="flex items-center gap-2">
              <Input value={a.answer_text} onChange={e => updateAnswer(a._key, e.target.value)} className="flex-1 h-8" />
              {question.answers.length > 1 && (
                <button onClick={() => removeAnswer(a._key)} className="text-[13px] font-semibold shrink-0" style={{ color: 'var(--rose)' }}>✕</button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addAnswer}>+ Add accepted answer</Button>
        </div>
      )}
    </div>
  )
}
