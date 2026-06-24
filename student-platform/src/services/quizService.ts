import { supabase } from './supabase'
import type { ModuleItemQuiz, QuizQuestion, QuizQuestionOption, QuizQuestionAnswer, StudentQuizAttempt, StudentQuizAnswer, QuestionType } from '@/types'

// ── Narrow builders — bypass Supabase's `never` insert/update inference ────

type EqOne = { eq(c: string, v: string): Promise<{ error: Error | null }> }
type SelectSingle = { select(): { single(): Promise<{ data: unknown; error: Error | null }> } }

type QInsert = {
  item_id: string; passing_score?: number; time_limit_minutes?: number | null
  shuffle_questions?: boolean; show_correct_answers?: boolean; attempts_allowed?: number
}
type QUpdate = Partial<{
  passing_score: number; time_limit_minutes: number | null
  shuffle_questions: boolean; show_correct_answers: boolean; attempts_allowed: number; updated_at: string
}>
type QBuilder = { insert(d: QInsert): SelectSingle; update(d: QUpdate): EqOne }
function qTable() { return supabase.from('module_item_quizzes') as unknown as QBuilder }

type QqInsert = { quiz_id: string; type: QuestionType; question_text: string; description: string | null; points: number; order_index: number }
type QqUpdate = Partial<{ type: QuestionType; question_text: string; description: string | null; points: number; order_index: number }>
type QqBuilder = { insert(d: QqInsert): SelectSingle; update(d: QqUpdate): EqOne }
function qqTable() { return supabase.from('quiz_questions') as unknown as QqBuilder }

type QoInsert = { question_id: string; option_text: string; is_correct: boolean; order_index: number }
type QoBuilder = { insert(d: QoInsert): Promise<{ error: Error | null }> }
function qoTable() { return supabase.from('quiz_question_options') as unknown as QoBuilder }

type QaInsert = { question_id: string; answer_text: string; is_correct: boolean }
type QaBuilder = { insert(d: QaInsert): Promise<{ error: Error | null }> }
function qaTable() { return supabase.from('quiz_question_answers') as unknown as QaBuilder }

type SqaAttemptInsert = { student_id: string; quiz_id: string; attempt_number: number }
type SqaAttemptUpdate = Partial<{ completed_at: string | null; score: number | null; passed: boolean | null; time_spent_seconds: number | null }>
type SqaAttemptBuilder = { insert(d: SqaAttemptInsert): SelectSingle; update(d: SqaAttemptUpdate): EqOne }
function sqaAttemptTable() { return supabase.from('student_quiz_attempts') as unknown as SqaAttemptBuilder }

type SqaInsert = { attempt_id: string; question_id: string; student_answer: string | null; is_correct: boolean; points_earned: number }
type SqaBuilder = { insert(d: SqaInsert[]): Promise<{ error: Error | null }> }
function sqaTable() { return supabase.from('student_quiz_answers') as unknown as SqaBuilder }

// ── Shapes used by the admin editor & student-taking flow ──────────────────
// All public functions key off the module item's id (`itemId`) — callers never
// need to know about module_item_quizzes' own internal id.

export interface OptionInput {
  id?: string
  option_text: string
  is_correct: boolean
  order_index: number
}
export interface AnswerInput {
  id?: string
  answer_text: string
}
export interface QuestionInput {
  id?: string
  type: QuestionType
  question_text: string
  description?: string | null
  points: number
  order_index: number
  options?: OptionInput[]
  answers?: AnswerInput[]
}
export interface QuizConfigInput {
  passing_score: number
  time_limit_minutes?: number | null
  shuffle_questions: boolean
  show_correct_answers: boolean
  attempts_allowed: number
}

export interface QuestionWithChoices extends QuizQuestion {
  options: QuizQuestionOption[]
  answers: QuizQuestionAnswer[]
}
export interface QuizDetail extends ModuleItemQuiz {
  questions: QuestionWithChoices[]
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function gradeAnswer(question: QuestionWithChoices, studentAnswer: string | null): boolean {
  if (question.type === 'short_answer') {
    const normalized = (studentAnswer ?? '').trim().toLowerCase()
    return normalized.length > 0 && question.answers.some(a => a.answer_text.trim().toLowerCase() === normalized)
  }
  const selected = question.options.find(o => o.id === studentAnswer)
  return !!selected?.is_correct
}

// ── Reads ─────────────────────────────────────────────────────────────────

export async function getQuizForItem(itemId: string): Promise<ModuleItemQuiz | null> {
  const { data } = await supabase.from('module_item_quizzes').select('*').eq('item_id', itemId).single()
  return (data ?? null) as unknown as ModuleItemQuiz | null
}

async function fetchQuizDetailByConfigId(configId: string): Promise<QuizDetail> {
  const { data: quizRow, error } = await supabase.from('module_item_quizzes').select('*').eq('id', configId).single()
  if (error) throw error
  const quiz = quizRow as unknown as ModuleItemQuiz

  const { data: questions } = await supabase.from('quiz_questions').select('*').eq('quiz_id', configId).order('order_index', { ascending: true })
  const questionRows = (questions ?? []) as unknown as QuizQuestion[]
  if (questionRows.length === 0) return { ...quiz, questions: [] }

  const questionIds = questionRows.map(q => q.id)
  const [{ data: options }, { data: answers }] = await Promise.all([
    supabase.from('quiz_question_options').select('*').in('question_id', questionIds).order('order_index', { ascending: true }),
    supabase.from('quiz_question_answers').select('*').in('question_id', questionIds),
  ])
  const optionRows = (options ?? []) as unknown as QuizQuestionOption[]
  const answerRows  = (answers ?? []) as unknown as QuizQuestionAnswer[]

  const optionsByQ: Record<string, QuizQuestionOption[]> = {}
  for (const o of optionRows) (optionsByQ[o.question_id] ??= []).push(o)
  const answersByQ: Record<string, QuizQuestionAnswer[]> = {}
  for (const a of answerRows) (answersByQ[a.question_id] ??= []).push(a)

  let finalQuestions = questionRows.map(q => ({ ...q, options: optionsByQ[q.id] ?? [], answers: answersByQ[q.id] ?? [] }))
  if (quiz.shuffle_questions) finalQuestions = shuffleArray(finalQuestions)

  return { ...quiz, questions: finalQuestions }
}

export async function getQuizDetail(itemId: string): Promise<QuizDetail | null> {
  const config = await getQuizForItem(itemId)
  if (!config) return null
  return fetchQuizDetailByConfigId(config.id)
}

// ── Question / option / answer CRUD (admin) ─────────────────────────────────

async function createQuestion(quizConfigId: string, data: { type: QuestionType; question_text: string; description: string | null; points: number; order_index: number }): Promise<QuizQuestion> {
  const { data: row, error } = await qqTable().insert({ quiz_id: quizConfigId, ...data }).select().single()
  if (error) throw error
  return row as unknown as QuizQuestion
}

async function deleteQuestion(id: string): Promise<void> {
  const { error } = await supabase.from('quiz_questions').delete().eq('id', id)
  if (error) throw error
}

async function createOption(questionId: string, data: { option_text: string; is_correct: boolean; order_index: number }): Promise<void> {
  const { error } = await qoTable().insert({ question_id: questionId, ...data })
  if (error) throw error
}

async function createAnswer(questionId: string, answerText: string): Promise<void> {
  const { error } = await qaTable().insert({ question_id: questionId, answer_text: answerText, is_correct: true })
  if (error) throw error
}

async function saveQuestionChoices(questionId: string, q: QuestionInput): Promise<void> {
  if (q.type === 'short_answer') {
    for (const a of q.answers ?? []) await createAnswer(questionId, a.answer_text)
  } else {
    for (const o of q.options ?? []) await createOption(questionId, { option_text: o.option_text, is_correct: o.is_correct, order_index: o.order_index })
  }
}

// ── Quiz CRUD (admin) — keyed by the module item's id ───────────────────────

export async function createQuiz(itemId: string, quizData: QuizConfigInput, questions: QuestionInput[]): Promise<ModuleItemQuiz> {
  const { data, error } = await qTable().insert({ item_id: itemId, ...quizData }).select().single()
  if (error) throw error
  const quiz = data as unknown as ModuleItemQuiz

  for (const q of questions) {
    const created = await createQuestion(quiz.id, { type: q.type, question_text: q.question_text, description: q.description ?? null, points: q.points, order_index: q.order_index })
    await saveQuestionChoices(created.id, q)
  }
  return quiz
}

export async function updateQuiz(itemId: string, quizData: Partial<QuizConfigInput>, questions: QuestionInput[]): Promise<void> {
  const config = await getQuizForItem(itemId)
  if (!config) throw new Error('Quiz configuration not found for this item.')

  if (Object.keys(quizData).length > 0) {
    const { error } = await qTable().update({ ...quizData, updated_at: new Date().toISOString() }).eq('id', config.id)
    if (error) throw error
  }

  const { data: existing } = await supabase.from('quiz_questions').select('id').eq('quiz_id', config.id)
  const existingIds = ((existing ?? []) as { id: string }[]).map(q => q.id)
  const keepIds = new Set(questions.filter(q => q.id).map(q => q.id as string))
  for (const id of existingIds) {
    if (!keepIds.has(id)) await deleteQuestion(id)
  }

  for (const q of questions) {
    let questionId: string
    if (q.id) {
      const { error } = await qqTable().update({
        type: q.type, question_text: q.question_text, description: q.description ?? null, points: q.points, order_index: q.order_index,
      }).eq('id', q.id)
      if (error) throw error
      questionId = q.id
      // Options/answers are small lists — simplest correct approach is wipe + recreate on every save
      await supabase.from('quiz_question_options').delete().eq('question_id', questionId)
      await supabase.from('quiz_question_answers').delete().eq('question_id', questionId)
    } else {
      const created = await createQuestion(config.id, { type: q.type, question_text: q.question_text, description: q.description ?? null, points: q.points, order_index: q.order_index })
      questionId = created.id
    }
    await saveQuestionChoices(questionId, q)
  }
}

// ── Student attempts ────────────────────────────────────────────────────────

export async function getStudentQuizAttempts(studentId: string, itemId: string): Promise<StudentQuizAttempt[]> {
  const config = await getQuizForItem(itemId)
  if (!config) return []
  const { data, error } = await supabase
    .from('student_quiz_attempts')
    .select('*')
    .eq('student_id', studentId)
    .eq('quiz_id', config.id)
    .order('attempt_number', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as StudentQuizAttempt[]
}

export async function startQuizAttempt(studentId: string, itemId: string): Promise<StudentQuizAttempt> {
  const config = await getQuizForItem(itemId)
  if (!config) throw new Error('This quiz is not configured yet.')

  const attempts = await getStudentQuizAttempts(studentId, itemId)
  if (config.attempts_allowed !== -1 && attempts.length >= config.attempts_allowed) {
    throw new Error('No attempts remaining for this quiz.')
  }

  const { data, error } = await sqaAttemptTable()
    .insert({ student_id: studentId, quiz_id: config.id, attempt_number: attempts.length + 1 })
    .select().single()
  if (error) throw error
  return data as unknown as StudentQuizAttempt
}

export interface QuestionResult {
  question: QuestionWithChoices
  studentAnswer: string | null
  isCorrect: boolean
  pointsEarned: number
}
export interface QuizAttemptResult {
  attempt: StudentQuizAttempt
  questionResults: QuestionResult[]
  totalPoints: number
  earnedPoints: number
  passingScore: number
}

export async function completeQuizAttempt(
  attemptId: string,
  answers: Record<string, string>,
  timeSpentSeconds: number,
): Promise<QuizAttemptResult> {
  const { data: attemptRow, error: attemptErr } = await supabase.from('student_quiz_attempts').select('*').eq('id', attemptId).single()
  if (attemptErr) throw attemptErr
  const attempt = attemptRow as unknown as StudentQuizAttempt

  const quiz = await fetchQuizDetailByConfigId(attempt.quiz_id)

  let totalPoints = 0
  let earnedPoints = 0
  const questionResults: QuestionResult[] = []
  const answerRows: SqaInsert[] = []

  for (const q of quiz.questions) {
    totalPoints += q.points
    const studentAnswer = answers[q.id] ?? null
    const isCorrect = gradeAnswer(q, studentAnswer)
    const pointsEarned = isCorrect ? q.points : 0
    earnedPoints += pointsEarned
    questionResults.push({ question: q, studentAnswer, isCorrect, pointsEarned })
    answerRows.push({ attempt_id: attemptId, question_id: q.id, student_answer: studentAnswer, is_correct: isCorrect, points_earned: pointsEarned })
  }

  if (answerRows.length > 0) {
    const { error } = await sqaTable().insert(answerRows)
    if (error) throw error
  }

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
  const passed = score >= quiz.passing_score
  const completedAt = new Date().toISOString()

  const { error: updateErr } = await sqaAttemptTable()
    .update({ completed_at: completedAt, score, passed, time_spent_seconds: timeSpentSeconds })
    .eq('id', attemptId)
  if (updateErr) throw updateErr

  return {
    attempt: { ...attempt, completed_at: completedAt, score, passed, time_spent_seconds: timeSpentSeconds },
    questionResults, totalPoints, earnedPoints, passingScore: quiz.passing_score,
  }
}

export async function getAttemptResult(attemptId: string): Promise<QuizAttemptResult> {
  const { data: attemptRow, error } = await supabase.from('student_quiz_attempts').select('*').eq('id', attemptId).single()
  if (error) throw error
  const attempt = attemptRow as unknown as StudentQuizAttempt

  const quiz = await fetchQuizDetailByConfigId(attempt.quiz_id)
  const { data: answerRows } = await supabase.from('student_quiz_answers').select('*').eq('attempt_id', attemptId)
  const answerMap = Object.fromEntries(((answerRows ?? []) as unknown as StudentQuizAnswer[]).map(a => [a.question_id, a]))

  let totalPoints = 0
  let earnedPoints = 0
  const questionResults: QuestionResult[] = quiz.questions.map(q => {
    totalPoints += q.points
    const a = answerMap[q.id]
    earnedPoints += a?.points_earned ?? 0
    return { question: q, studentAnswer: a?.student_answer ?? null, isCorrect: a?.is_correct ?? false, pointsEarned: a?.points_earned ?? 0 }
  })

  return { attempt, questionResults, totalPoints, earnedPoints, passingScore: quiz.passing_score }
}
