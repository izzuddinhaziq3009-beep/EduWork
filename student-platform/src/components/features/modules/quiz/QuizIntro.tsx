import type { ModuleItemQuiz } from '@/types'

interface Props {
  quiz: ModuleItemQuiz
  questionCount: number
  totalPoints: number
  attemptsUsed: number
  onStart: () => void
  starting: boolean
  canStart: boolean
}

export function QuizIntro({ quiz, questionCount, totalPoints, attemptsUsed, onStart, starting, canStart }: Props) {
  return (
    <div className="space-y-4">
      <div className="text-[12px] font-mono muted uppercase tracking-wide">Quiz details</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
        <div><span className="muted">Passing score</span><div className="font-semibold">{quiz.passing_score}%</div></div>
        <div><span className="muted">Questions</span><div className="font-semibold">{questionCount}</div></div>
        <div><span className="muted">Points</span><div className="font-semibold">{totalPoints}</div></div>
        <div><span className="muted">Time limit</span><div className="font-semibold">{quiz.time_limit_minutes ? `${quiz.time_limit_minutes} min` : 'None'}</div></div>
      </div>
      <div className="text-[12.5px] muted">
        Attempts allowed: {attemptsUsed} of {quiz.attempts_allowed === -1 ? 'unlimited' : quiz.attempts_allowed} used
      </div>
      <button onClick={onStart} disabled={starting || !canStart}
        className="w-full h-11 rounded-xl text-[13.5px] font-semibold text-white disabled:opacity-50 transition-opacity"
        style={{ background: 'var(--primary)' }}>
        {!canStart ? 'No attempts remaining' : starting ? 'Starting…' : 'Start Quiz'}
      </button>
    </div>
  )
}
