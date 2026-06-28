import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/services/supabase'
import { AuthField } from '@/components/auth/AuthField'
import { MailIcon, ArrowIcon, CheckIcon, ShieldIcon } from '@/components/auth/AuthIcons'

export function ForgotPasswordPage() {
  const [email, setEmail]   = useState('')
  const [error, setError]   = useState('')
  const [sending, setSend]  = useState(false)
  const [sent, setSent]     = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Email is required.'); return }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setError("That doesn't look like a valid email."); return }
    setSend(true)
    setError('')
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (err) throw err
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSend(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Logo */}
      <Link to="/login" className="flex items-center gap-2.5 mb-8 sm:mb-10" style={{ color: 'var(--primary)' }}>
        <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
          <rect x="2" y="2" width="28" height="28" rx="7" fill="currentColor"/>
          <path d="M9 20.5L16 9l7 11.5H17.5L16 18l-1.5 2.5H9z" fill="#fff"/>
          <circle cx="16" cy="22.5" r="1.5" fill="#fff"/>
        </svg>
        <span className="font-display text-[22px] font-semibold tracking-tight" style={{ color: 'var(--ink)' }}>Eduwork</span>
      </Link>

      <section className="bg-surface hairline rounded-3xl shadow-card w-full max-w-[460px] p-6 sm:p-8 lg:p-10">
        {sent ? (
          <div className="slide-up text-center flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full grid place-items-center check-pop"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
              <CheckIcon width={28} height={28} />
            </div>
            <div>
              <h2 className="font-display text-[28px] font-semibold tracking-tight">Check your inbox.</h2>
              <p className="muted text-[14px] mt-2 leading-relaxed max-w-sm">
                We sent a reset link to <strong className="ink-2">{email}</strong>. It expires in 60 minutes.
              </p>
            </div>
            <Link to="/login"
              className="mt-2 shadow-cta text-white font-semibold text-[13.5px] h-11 px-6 rounded-xl flex items-center gap-1.5 transition-opacity hover:opacity-90"
              style={{ background: 'var(--cta)' }}>
              Back to login <ArrowIcon width={14} height={14} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 slide-up">
            <header>
              <div className="font-mono text-[11px] tracking-[0.18em] uppercase muted mb-1.5">Password reset</div>
              <h2 className="font-display text-[30px] font-semibold tracking-tight leading-tight">Forgot your password?</h2>
              <p className="muted text-[14px] mt-1.5">Enter your email and we'll send you a reset link.</p>
            </header>

            <AuthField Icon={MailIcon} label="Email address" type="email" name="email"
              value={email} onChange={v => { setEmail(v); setError('') }}
              placeholder="you@school.edu" autoComplete="email" error={error} />

            <button type="submit" disabled={sending}
              className="shadow-cta text-white font-semibold text-[14px] h-12 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 transition-opacity"
              style={{ background: 'var(--cta)' }}>
              {sending
                ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin"><circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5"/><path d="M12 3a9 9 0 0 1 9 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>Sending…</>
                : <><span>Send reset link</span><ArrowIcon width={16} height={16} /></>}
            </button>

            <p className="text-center text-[13px] muted">
              Remembered it?{' '}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                Back to login
              </Link>
            </p>

            <div className="hairline rounded-xl px-3.5 py-2.5 flex items-center gap-2.5" style={{ background: 'var(--hair-2)' }}>
              <ShieldIcon width={15} height={15} className="text-[color:var(--accent)]" />
              <div className="text-[11.5px] ink-2">Reset links expire after <strong>60 minutes</strong></div>
            </div>
          </form>
        )}
      </section>

      <footer className="mt-8 text-center text-[11.5px] muted font-mono">
        EDUWORK · STUDENT EXPERIENCE PLATFORM · v1.0
      </footer>
    </div>
  )
}
