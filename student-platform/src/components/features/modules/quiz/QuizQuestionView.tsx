import { Input } from '@/components/ui/input'
import type { QuestionWithChoices } from '@/services/quizService'

interface Props {
  question: QuestionWithChoices
  value: string
  onChange: (value: string) => void
}

export function QuizQuestionView({ question, value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[16px] font-semibold leading-relaxed">{question.question_text}</p>
        {question.description && <p className="text-[13px] muted mt-1.5">{question.description}</p>}
      </div>

      {question.type === 'short_answer' ? (
        <Input value={value} onChange={e => onChange(e.target.value)} placeholder="Type your answer…" className="h-11" />
      ) : (
        <div className="space-y-2">
          {question.options.map(o => (
            <button key={o.id} type="button" onClick={() => onChange(o.id)}
              className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl hairline transition-colors"
              style={{ background: value === o.id ? 'var(--primary-soft)' : undefined, borderColor: value === o.id ? 'var(--primary)' : undefined }}>
              <span className="w-5 h-5 rounded-full shrink-0 grid place-items-center hairline"
                style={{ background: value === o.id ? 'var(--primary)' : 'transparent' }}>
                {value === o.id && <span className="w-2 h-2 rounded-full" style={{ background: '#fff' }} />}
              </span>
              <span className="text-[14px] ink-2">{o.option_text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
