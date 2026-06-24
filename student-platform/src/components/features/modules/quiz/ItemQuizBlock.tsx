import { useState } from 'react'
import { useQuizForItem } from '@/hooks/useQuiz'
import { QuizTaker } from './QuizTaker'

interface Props {
  itemId: string
  moduleId: string
  studentId: string
  quizPassed: boolean
}

export function ItemQuizBlock({ itemId, moduleId, studentId, quizPassed }: Props) {
  const { data: quiz, isLoading } = useQuizForItem(itemId)
  const [showTaker, setShowTaker] = useState(!quizPassed)

  if (isLoading) return <p className="text-[13px] muted">Loading quiz…</p>
  if (!quiz) return <p className="text-[13px] muted">This quiz hasn't been configured yet.</p>

  if (!showTaker) {
    return quizPassed ? (
      <div className="hairline rounded-2xl p-5 flex items-center justify-between gap-3" style={{ background: 'var(--accent-soft)' }}>
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}><path d="M5 12.5l4.5 4.5L19 7"/></svg>
          <div className="text-[13.5px] font-semibold" style={{ color: 'var(--accent)' }}>Quiz passed</div>
        </div>
        <button onClick={() => setShowTaker(true)} className="text-[12.5px] font-semibold shrink-0" style={{ color: 'var(--primary)' }}>
          Retake quiz
        </button>
      </div>
    ) : (
      <div className="hairline rounded-2xl p-5 flex items-center justify-between gap-3" style={{ background: 'var(--warn-soft)' }}>
        <div className="text-[13.5px] font-semibold" style={{ color: 'var(--warn)' }}>Quiz required to complete this item</div>
        <button onClick={() => setShowTaker(true)} className="text-[12.5px] font-semibold shrink-0" style={{ color: 'var(--primary)' }}>
          Take quiz →
        </button>
      </div>
    )
  }

  return (
    <div className="hairline rounded-2xl p-6">
      <QuizTaker itemId={itemId} moduleId={moduleId} studentId={studentId} onClose={() => setShowTaker(false)} />
    </div>
  )
}
