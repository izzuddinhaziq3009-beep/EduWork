import type { QuizAttemptResult, QuestionWithChoices } from '@/services/quizService'

interface Props {
  result: QuizAttemptResult
  showCorrectAnswers: boolean
  attemptsAllowed: number
  canRetake: boolean
  onRetake: () => void
  onBack: () => void
}

function formatAnswer(q: QuestionWithChoices, studentAnswer: string | null): string {
  if (!studentAnswer) return '(no answer)'
  if (q.type === 'short_answer') return studentAnswer
  return q.options.find(o => o.id === studentAnswer)?.option_text ?? '(no answer)'
}

function correctAnswerLabel(q: QuestionWithChoices): string {
  if (q.type === 'short_answer') return q.answers.map(a => a.answer_text).join(' / ')
  return q.options.find(o => o.is_correct)?.option_text ?? '—'
}

export function QuizResults({ result, showCorrectAnswers, attemptsAllowed, canRetake, onRetake, onBack }: Props) {
  const { attempt, questionResults, totalPoints, earnedPoints, passingScore } = result
  const passed = !!attempt.passed

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="text-[12px] font-mono muted uppercase tracking-wide mb-1">Quiz complete</div>
        <div className="font-display text-[34px] font-bold tracking-tight">
          {earnedPoints}/{totalPoints} <span className="text-[18px] font-medium muted">({attempt.score}%)</span>
        </div>
        <div className="mt-2">
          <span className="tag" style={{ background: passed ? 'var(--accent-soft)' : 'var(--rose-soft)', color: passed ? 'var(--accent)' : 'var(--rose)' }}>
            {passed ? '✅ PASSED' : '❌ FAILED'}
          </span>
        </div>
        {!passed && <p className="text-[13px] muted mt-2">You scored {attempt.score}%. You need {passingScore}% to pass.</p>}
      </div>

      <div className="space-y-3">
        <h3 className="text-[14px] font-semibold">Results breakdown</h3>
        {questionResults.map((qr, i) => (
          <div key={qr.question.id} className="hairline rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[13.5px] font-medium flex-1">{i + 1}. {qr.question.question_text}</p>
              <span className="text-[12.5px] font-semibold shrink-0" style={{ color: qr.isCorrect ? 'var(--accent)' : 'var(--rose)' }}>
                {qr.isCorrect ? `✅ +${qr.pointsEarned}` : '❌ 0'}
              </span>
            </div>
            {!qr.isCorrect && (
              <div className="mt-2 text-[12.5px] space-y-1">
                <div className="muted">Your answer: <span className="ink-2">{formatAnswer(qr.question, qr.studentAnswer)}</span></div>
                {showCorrectAnswers && (
                  <div className="muted">Correct answer: <span style={{ color: 'var(--accent)' }}>{correctAnswerLabel(qr.question)}</span></div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center text-[12.5px] muted font-mono">
        Attempts used: {attempt.attempt_number} of {attemptsAllowed === -1 ? 'unlimited' : attemptsAllowed}
      </div>

      <div className="flex gap-2">
        <button onClick={onBack}
          className="flex-1 h-10 rounded-xl text-[13.5px] font-semibold hairline hover:bg-[var(--hair-2)] transition-colors">
          ← Back to section
        </button>
        {canRetake && (
          <button onClick={onRetake}
            className="flex-1 h-10 rounded-xl text-[13.5px] font-semibold text-white" style={{ background: 'var(--primary)' }}>
            Retake quiz
          </button>
        )}
      </div>
    </div>
  )
}
