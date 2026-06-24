import { useState, useEffect, useRef } from 'react'

interface Props {
  totalSeconds: number
  onExpire: () => void
}

export function QuizTimer({ totalSeconds, onExpire }: Props) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const onExpireRef = useRef(onExpire)
  useEffect(() => { onExpireRef.current = onExpire }, [onExpire])

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          onExpireRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const low = remaining <= 60

  return (
    <div className="flex items-center gap-1.5 font-mono text-[13px] font-semibold px-2.5 py-1 rounded-lg shrink-0"
      style={{ background: low ? 'var(--rose-soft)' : 'var(--hair-2)', color: low ? 'var(--rose)' : 'var(--ink-2)' }}>
      ⏱️ {mins}:{secs.toString().padStart(2, '0')} remaining
    </div>
  )
}
