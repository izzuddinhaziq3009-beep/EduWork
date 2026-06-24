import type { OptionInput, AnswerInput, QuestionInput } from '@/services/quizService'
import type { QuestionType } from '@/types'

// Local-only `_key` lets the UI track unsaved questions/options/answers (no DB `id` yet)
// before they're persisted. Stripped out via toQuestionInput() right before saving.
export type EditableOption = OptionInput & { _key: string }
export type EditableAnswer = AnswerInput & { _key: string }
export type EditableQuestion = Omit<QuestionInput, 'options' | 'answers'> & {
  _key: string
  options: EditableOption[]
  answers: EditableAnswer[]
}

function newKey(): string {
  return crypto.randomUUID()
}

export function newOption(orderIndex: number): EditableOption {
  return { _key: newKey(), option_text: '', is_correct: false, order_index: orderIndex }
}

export function newAnswer(): EditableAnswer {
  return { _key: newKey(), answer_text: '' }
}

export function newQuestion(type: QuestionType, orderIndex: number): EditableQuestion {
  const base = { _key: newKey(), type, question_text: '', description: '', points: 1, order_index: orderIndex }
  if (type === 'true_false') {
    return {
      ...base,
      options: [
        { _key: newKey(), option_text: 'True',  is_correct: false, order_index: 0 },
        { _key: newKey(), option_text: 'False', is_correct: false, order_index: 1 },
      ],
      answers: [],
    }
  }
  if (type === 'multiple_choice') {
    return { ...base, options: [newOption(0), newOption(1)], answers: [] }
  }
  return { ...base, options: [], answers: [newAnswer()] }
}

export function questionToEditable(q: QuestionInput): EditableQuestion {
  return {
    ...q,
    _key: q.id ?? newKey(),
    options: (q.options ?? []).map(o => ({ ...o, _key: o.id ?? newKey() })),
    answers: (q.answers ?? []).map(a => ({ ...a, _key: a.id ?? newKey() })),
  }
}

export function toQuestionInput(q: EditableQuestion): QuestionInput {
  const { id, type, question_text, description, points, order_index, options, answers } = q
  return {
    ...(id ? { id } : {}),
    type,
    question_text,
    description,
    points,
    order_index,
    options: options.map(o => ({
      ...(o.id ? { id: o.id } : {}),
      option_text: o.option_text,
      is_correct: o.is_correct,
      order_index: o.order_index,
    })),
    answers: answers.map(a => ({
      ...(a.id ? { id: a.id } : {}),
      answer_text: a.answer_text,
    })),
  }
}
