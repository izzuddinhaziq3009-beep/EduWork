import { fmtRelative } from '@/utils/formatters'
import type { MentorFeedback } from '@/types'

export function FeedbackView({ feedback }: { feedback: MentorFeedback }) {
  return (
    <div className="hairline rounded-2xl p-5 space-y-4" style={{ background: 'var(--accent-soft)' }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg grid place-items-center font-mono font-semibold text-white text-[13px] shrink-0"
          style={{ background: 'var(--accent)' }}>
          M
        </div>
        <div>
          <div className="text-[13.5px] font-semibold" style={{ color: 'var(--accent)' }}>Mentor Feedback</div>
          <div className="text-[11.5px] muted">{fmtRelative(feedback.created_at)}</div>
        </div>
        <span className="ml-auto tag" style={{
          background: feedback.status === 'approved' ? 'var(--accent-soft)' : 'var(--rose-soft)',
          color:      feedback.status === 'approved' ? 'var(--accent)'      : 'var(--rose)',
        }}>
          {feedback.status === 'approved' ? 'Approved' : 'Revision requested'}
        </span>
      </div>
      <p className="text-[14px] leading-relaxed ink-2">{feedback.feedback_text}</p>
    </div>
  )
}
