import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useRedeemClassCode } from '@/hooks/useClasses'

export function JoinWithCodeCard() {
  const { user } = useAuthStore()
  const [code, setCode] = useState('')
  const redeem = useRedeemClassCode()

  const handleRedeem = () => {
    if (!user || code.trim().length < 4) return
    redeem.mutate(
      { code: code.trim().toUpperCase(), studentId: user.id },
      { onSuccess: () => setCode('') },
    )
  }

  return (
    <div className="bg-surface hairline rounded-2xl p-5 space-y-4">
      <div>
        <label className="text-[12px] font-mono tracking-wide muted uppercase block mb-1.5">
          Class code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            onKeyDown={e => e.key === 'Enter' && handleRedeem()}
            placeholder="e.g. AB3X7YZ9"
            maxLength={12}
            spellCheck={false}
            className="flex-1 h-10 px-3 rounded-xl hairline bg-[var(--bg)] font-mono text-[14px] tracking-widest placeholder:normal-case placeholder:font-sans placeholder:tracking-normal outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          <button
            onClick={handleRedeem}
            disabled={code.trim().length < 4 || redeem.isPending}
            className="h-10 px-5 rounded-xl text-[13.5px] font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90 shrink-0"
            style={{ background: 'var(--primary)' }}>
            {redeem.isPending ? 'Joining…' : 'Join'}
          </button>
        </div>
      </div>
      <p className="text-[11.5px] muted">
        Codes are case-insensitive. Joining a class automatically enrolls you in the module
        and connects you to the mentor.
      </p>
    </div>
  )
}
