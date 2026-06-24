import { useState } from 'react'
import { useQuizDetail, useStudentQuizAttempts, useStartQuizAttempt, useCompleteQuizAttempt } from '@/hooks/useQuiz'
import { QuizIntro } from './QuizIntro'
import { QuizQuestionView } from './QuizQuestionView'
import { QuizTimer } from './QuizTimer'
import { QuizResults } from './QuizResults'
import type { QuizAttemptResult } from '@/services/quizService'

interface Props {
  itemId: string
  moduleId: string
  studentId: string
  onClose: () => void
}

type Phase = 'intro' | 'taking' | 'results'

export function QuizTaker({ itemId, moduleId, studentId, onClose }: Props) {
  const { data: quiz, isLoading } = useQuizDetail(itemId)
  const { data: attempts = [] } = useStudentQuizAttempts(studentId, itemId)
  const startAttempt = useStartQuizAttempt()
  const completeAttempt = useCompleteQuizAttempt()

  const [phase,     setPhase]     = useState<Phase>('intro')
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [qIndex,    setQIndex]    = useState(0)
  const [answers,   setAnswers]   = useState<Record<string, string>>({})
  const [startedAt, setStartedAt] = useState(0)
  const [result,    setResult]    = useState<QuizAttemptResult | null>(null)

  if (isLoading || !quiz) {
    return <p className="text-[13px] muted">Loading quiz…</p>
  }

  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0)
  const canStart = quiz.attempts_allowed === -1 || attempts.length < quiz.attempts_allowed

  const handleStart = () => {
    startAttempt.mutate({ studentId, itemId }, {
      onSuccess: attempt => {
        setAttemptId(attempt.id)
        setAnswers({})
        setQIndex(0)
        setStartedAt(Date.now())
        setPhase('taking')
      },
    })
  }

  const handleSubmit = () => {
    if (!attemptId) return
    const timeSpentSeconds = Math.round((Date.now() - startedAt) / 1000)
    completeAttempt.mutate(
      { attemptId, answers, timeSpentSeconds, moduleId, itemId, studentId },
      { onSuccess: res => { setResult(res); setPhase('results') } },
    )
  }

  const handleRetake = () => { setResult(null); setPhase('intro') }
  const handleBack    = () => { setResult(null); setPhase('intro'); onClose() }

  if (phase === 'intro') {
    return (
      <QuizIntro quiz={quiz} questionCount={quiz.questions.length} totalPoints={totalPoints}
        attemptsUsed={attempts.length} onStart={handleStart} starting={startAttempt.isPending} canStart={canStart} />
    )
  }

  if (phase === 'taking') {
    const question = quiz.questions[qIndex]
    const isLast = qIndex === quiz.questions.length - 1
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] font-mono muted">Question {qIndex + 1} of {quiz.questions.length}</span>
          {quiz.time_limit_minutes && (
            <QuizTimer totalSeconds={quiz.time_limit_minutes * 60} onExpire={handleSubmit} />
          )}
        </div>
        <QuizQuestionView question={question} value={answers[question.id] ?? ''}
          onChange={v => setAnswers(prev => ({ ...prev, [question.id]: v }))} />
        <div className="flex items-center justify-between gap-3 pt-2">
          <button onClick={() => setQIndex(i => Math.max(0, i - 1))} disabled={qIndex === 0}
            className="h-9 px-3.5 rounded-lg text-[13px] font-semibold hairline hover:bg-[var(--hair-2)] disabled:opacity-40 transition-colors">
            ← Previous
          </button>
          {isLast ? (
            <button onClick={handleSubmit} disabled={completeAttempt.isPending}
              className="h-9 px-4 rounded-lg text-[13px] font-semibold text-white disabled:opacity-70" style={{ background: 'var(--accent)' }}>
              {completeAttempt.isPending ? 'Submitting…' : 'Submit Quiz'}
            </button>
          ) : (
            <button onClick={() => setQIndex(i => Math.min(quiz.questions.length - 1, i + 1))}
              className="h-9 px-3.5 rounded-lg text-[13px] font-semibold hairline hover:bg-[var(--hair-2)] transition-colors">
              Next →
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!result) return null
  return (
    <QuizResults
      result={result}
      showCorrectAnswers={quiz.show_correct_answers}
      attemptsAllowed={quiz.attempts_allowed}
      canRetake={quiz.attempts_allowed === -1 || result.attempt.attempt_number < quiz.attempts_allowed}
      onRetake={handleRetake}
      onBack={handleBack}
    />
  )
}
