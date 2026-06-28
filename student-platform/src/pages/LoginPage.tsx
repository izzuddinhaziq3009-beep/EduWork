import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { BrandPanel } from '@/components/auth/BrandPanel'
import { AuthField, PasswordField } from '@/components/auth/AuthField'
import { MailIcon, ArrowIcon, ShieldIcon, GoogleIcon, CheckIcon } from '@/components/auth/AuthIcons'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signInWithGoogle } = useAuthStore()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [errors, setErrors]     = useState<Record<string, string>>({})
  const [submitting, setSub]    = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  const roleRedirect = (r: string | null) => {
    if (r === 'mentor')  return '/mentor/dashboard'
    if (r === 'company') return '/company/dashboard'
    if (r === 'admin')   return '/admin/dashboard'
    return '/dashboard'
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!email)                                   e.email = 'Email is required.'
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = "That doesn't look like a valid email."
    if (!password) e.password = 'Enter your password.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSub(true)
    setAuthError('')
    try {
      await signIn(email, password)
      const { role: newRole } = useAuthStore.getState()
      navigate(roleRedirect(newRole))
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setSub(false)
    }
  }

  const handleGoogle = async () => {
    setAuthError('')
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
      // On success the browser navigates away to Google immediately — this
      // component unmounts, so there's no further state to set here.
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Google sign-in failed.')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_minmax(560px,680px)]">
      <div className="hidden lg:block">
        <BrandPanel />
      </div>

      <main className="flex flex-col p-4 sm:p-6 lg:p-10 bg-[var(--bg)]" style={{ minHeight: '100vh' }}>
        {/* Top bar */}
        <header className="flex items-center justify-between flex-wrap gap-3 mb-8 sm:mb-10">
          <div className="hairline rounded-xl p-1 flex bg-[var(--hair-2)] w-fit">
            <Link to="/login"
              className="px-4 py-1.5 rounded-lg text-[13px] font-semibold bg-[var(--surface)] shadow-card ink">
              Log in
            </Link>
            <Link to="/signup"
              className="px-4 py-1.5 rounded-lg text-[13px] font-semibold muted hover:text-[color:var(--ink)]">
              Sign up
            </Link>
          </div>
          <div className="text-[12.5px] muted">
            Need help?{' '}
            <a className="font-medium underline ink-2 cursor-pointer">Contact support</a>
          </div>
        </header>

        {/* Card */}
        <div className="flex-1 flex items-start justify-center">
          <section className="bg-surface hairline rounded-3xl shadow-card w-full max-w-[520px] p-5 sm:p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 slide-up">
              <header>
                <div className="font-mono text-[11px] tracking-[0.18em] uppercase muted mb-1.5">Log in to Eduwork</div>
                <h2 className="font-display text-[26px] sm:text-[30px] lg:text-[32px] font-semibold tracking-tight leading-tight">Welcome back.</h2>
                <p className="muted text-[14px] mt-1.5">Pick up where you left off — your cohort is waiting.</p>
              </header>

              {/* OAuth row */}
              <button type="button" onClick={handleGoogle} disabled={googleLoading}
                className="hairline rounded-xl h-12 flex items-center justify-center gap-2 text-[13.5px] font-semibold bg-surface hover:bg-[var(--hair-2)] disabled:opacity-60 transition-colors">
                <GoogleIcon width={18} height={18} className="shrink-0" />{googleLoading ? 'Redirecting…' : 'Continue with Google'}
              </button>

              <div className="flex items-center gap-3 text-[11.5px] font-mono uppercase tracking-widest muted">
                <span className="flex-1 h-px" style={{ background: 'var(--hair)' }} />
                <span>or continue with email</span>
                <span className="flex-1 h-px" style={{ background: 'var(--hair)' }} />
              </div>

              {authError && (
                <div className="hairline rounded-xl px-4 py-3 text-[13px] font-medium"
                  style={{ background: 'var(--rose-soft)', color: 'var(--rose)', borderColor: 'var(--rose)' }}>
                  {authError}
                </div>
              )}

              <AuthField Icon={MailIcon} label="Email address" type="email" name="email"
                value={email} onChange={setEmail} placeholder="you@school.edu"
                autoComplete="email" error={errors.email} />

              <PasswordField label="Password" name="password"
                value={password} onChange={setPassword}
                error={errors.password}
                rightSlot={
                  <Link to="/forgot-password"
                    className="text-[12px] font-medium hover:underline"
                    style={{ color: 'var(--primary)' }}>
                    Forgot password?
                  </Link>
                } />

              <label className="flex items-center gap-2 cursor-pointer select-none -mt-1">
                <span className="w-4 h-4 rounded-md hairline grid place-items-center transition-colors"
                  style={{ background: remember ? 'var(--primary)' : '#fff', borderColor: remember ? 'var(--primary)' : 'var(--hair)' }}>
                  {remember && <CheckIcon width={12} height={12} style={{ color: '#fff' }} />}
                </span>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="sr-only" />
                <span className="text-[12.5px] ink-2">Keep me signed in for 30 days</span>
              </label>

              <button type="submit" disabled={submitting}
                className="shadow-cta text-white font-semibold text-[14px] h-12 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 transition-opacity"
                style={{ background: 'var(--cta)' }}>
                {submitting
                  ? <Spinner />
                  : <><span>Log in</span><ArrowIcon width={16} height={16} /></>}
              </button>

              <p className="text-center text-[13px] muted">
                Don't have an account?{' '}
                <Link to="/signup" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                  Sign up — it's free
                </Link>
              </p>

              <SecurityNote />
            </form>
          </section>
        </div>

        <footer className="mt-6 text-center text-[11.5px] muted font-mono">
          EDUWORK · STUDENT EXPERIENCE PLATFORM · v1.0
        </footer>
      </main>
    </div>
  )
}

function Spinner() {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin">
        <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5"/>
        <path d="M12 3a9 9 0 0 1 9 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
      Working…
    </span>
  )
}

function SecurityNote() {
  return (
    <div className="hairline rounded-xl px-3.5 py-2.5 flex items-center gap-2.5" style={{ background: 'var(--hair-2)' }}>
      <ShieldIcon width={15} height={15} className="text-[color:var(--accent)]" />
      <div className="text-[11.5px] ink-2">
        Protected by 2FA · SOC 2 Type II
        <span className="muted"> · We never sell your data</span>
      </div>
    </div>
  )
}
