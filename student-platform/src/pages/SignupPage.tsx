import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore, PENDING_APPROVAL_MESSAGE } from '@/stores/authStore'
import { BrandPanel } from '@/components/auth/BrandPanel'
import { AuthField, PasswordField, StrengthBar, passwordStrength } from '@/components/auth/AuthField'
import { MailIcon, UserIcon, ArrowIcon, ShieldIcon, GoogleIcon,
         CheckIcon, AlertIcon, BadgeIcon, BuildingIcon } from '@/components/auth/AuthIcons'
import type { UserRole } from '@/types'

const ROLES = [
  { id: 'student' as UserRole, label: 'Student',  Icon: BadgeIcon,   caption: 'I want to learn and build' },
  { id: 'mentor'  as UserRole, label: 'Mentor',   Icon: UserIcon,    caption: 'I want to guide students'  },
  { id: 'company' as UserRole, label: 'Company',  Icon: BuildingIcon, caption: 'I want to post challenges' },
]

export function SignupPage() {
  const navigate  = useNavigate()
  const [params]  = useSearchParams()
  const { signUp, signInWithGoogle } = useAuthStore()

  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole]         = useState<UserRole>('student')
  const [tos, setTos]           = useState(false)
  const [errors, setErrors]     = useState<Record<string, string>>({})
  const [submitting, setSub]    = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [pendingApproval, setPendingApproval] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name)    e.name = 'Tell us your full name.'
    if (!email)   e.email = 'Email is required.'
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = "That email doesn't look right."
    if (!password) e.password = 'Choose a password.'
    else if (passwordStrength(password).level < 2) e.password = 'Try something stronger — mix in a number or symbol.'
    if (!tos) e.tos = 'Please accept the terms to continue.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSub(true)
    setAuthError('')
    try {
      await signUp(email, password, name, role)
      const roleDefault = role === 'mentor' ? '/mentor/dashboard' : role === 'company' ? '/company/dashboard' : '/dashboard'
      // A `redirect` param (e.g. from the landing page's "Enroll" CTA) only makes sense for students
      const redirectTo = params.get('redirect')
      navigate(role === 'student' && redirectTo ? redirectTo : roleDefault)
    } catch (err) {
      if (err instanceof Error && err.message === PENDING_APPROVAL_MESSAGE) {
        setPendingApproval(true)
      } else {
        setAuthError(err instanceof Error ? err.message : 'Signup failed.')
      }
    } finally {
      setSub(false)
    }
  }

  const handleGoogle = async () => {
    setAuthError('')
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Google sign-in failed.')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_minmax(560px,720px)]">
      <div className="hidden lg:block">
        <BrandPanel />
      </div>

      <main className="flex flex-col p-4 sm:p-6 lg:p-10 bg-[var(--bg)]" style={{ minHeight: '100vh' }}>
        <header className="flex items-center justify-between flex-wrap gap-3 mb-8 sm:mb-10">
          <div className="hairline rounded-xl p-1 flex bg-[var(--hair-2)] w-fit">
            <Link to="/login"
              className="px-4 py-1.5 rounded-lg text-[13px] font-semibold muted hover:text-[color:var(--ink)]">
              Log in
            </Link>
            <Link to="/signup"
              className="px-4 py-1.5 rounded-lg text-[13px] font-semibold bg-[var(--surface)] shadow-card ink">
              Sign up
            </Link>
          </div>
          <div className="text-[12.5px] muted">
            Need help?{' '}
            <a className="font-medium underline ink-2 cursor-pointer">Contact support</a>
          </div>
        </header>

        <div className="flex-1 flex items-start justify-center overflow-y-auto pb-4">
          <section className="bg-surface hairline rounded-3xl shadow-card w-full max-w-[520px] p-5 sm:p-8 lg:p-10">
            {pendingApproval ? (
              <div className="slide-up text-center flex flex-col items-center gap-4 py-4">
                <div className="w-16 h-16 rounded-full grid place-items-center check-pop"
                  style={{ background: 'var(--warn-soft)', color: 'var(--warn)' }}>
                  <ShieldIcon width={28} height={28} />
                </div>
                <div>
                  <h2 className="font-display text-[26px] font-semibold tracking-tight">Account created.</h2>
                  <p className="muted text-[14px] mt-2 leading-relaxed max-w-sm">
                    Your <strong className="ink-2 capitalize">{role}</strong> account is awaiting admin approval.
                    We'll let you know once it's approved — you can then log in as usual.
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
                <div className="font-mono text-[11px] tracking-[0.18em] uppercase muted mb-1.5">Join Eduwork</div>
                <h2 className="font-display text-[26px] sm:text-[30px] lg:text-[32px] font-semibold tracking-tight leading-tight">Create your account.</h2>
                <p className="muted text-[14px] mt-1.5">Three minutes to set up, then we'll match you to your first challenge.</p>
              </header>

              {role === 'student' && (
                <button type="button" onClick={handleGoogle} disabled={googleLoading}
                  className="hairline rounded-xl h-12 flex items-center justify-center gap-2 text-[13.5px] font-semibold bg-surface hover:bg-[var(--hair-2)] disabled:opacity-60 transition-colors">
                  <GoogleIcon width={18} height={18} />{googleLoading ? 'Redirecting…' : 'Continue with Google'}
                </button>
              )}

              {role === 'student' && (
                <div className="flex items-center gap-3 text-[11.5px] font-mono uppercase tracking-widest muted">
                  <span className="flex-1 h-px" style={{ background: 'var(--hair)' }} />
                  <span>or sign up with email</span>
                  <span className="flex-1 h-px" style={{ background: 'var(--hair)' }} />
                </div>
              )}

              {authError && (
                <div className="hairline rounded-xl px-4 py-3 text-[13px] font-medium"
                  style={{ background: 'var(--rose-soft)', color: 'var(--rose)', borderColor: 'var(--rose)' }}>
                  {authError}
                </div>
              )}

              <AuthField Icon={UserIcon} label="Full name" name="name"
                value={name} onChange={setName} placeholder="Maya Rodriguez"
                autoComplete="name" error={errors.name} />

              <AuthField Icon={MailIcon} label="Email address" type="email" name="email"
                value={email} onChange={setEmail} placeholder="you@school.edu"
                autoComplete="email" error={errors.email} />

              <PasswordField label="Password" name="password"
                value={password} onChange={setPassword}
                error={errors.password} autoComplete="new-password" />
              <StrengthBar pw={password} />

              {/* Role picker */}
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-[12.5px] font-medium ink-2">I'm signing up as</span>
                  <span className="text-[11px] muted font-mono">required</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {ROLES.map(r => {
                    const on = role === r.id
                    return (
                      <button key={r.id} type="button"
                        onClick={() => setRole(r.id)}
                        data-on={on}
                        className="role hairline rounded-xl px-3 py-3 text-left flex flex-col gap-2 bg-[var(--hair-2)] hover:border-[color:var(--ink-2)]">
                        <div className="flex items-center justify-between">
                          <span className="w-8 h-8 rounded-lg grid place-items-center role-ico"
                            style={{ background: on ? 'rgba(255,255,255,0.10)' : 'var(--primary-soft)', color: on ? '#fff' : 'var(--primary)' }}>
                            <r.Icon width={16} height={16} />
                          </span>
                          <span className="w-4 h-4 rounded-full grid place-items-center hairline"
                            style={{ borderColor: on ? '#fff' : 'var(--hair)', background: on ? '#fff' : 'transparent' }}>
                            {on && <span className="w-2 h-2 rounded-full" style={{ background: 'var(--ink)' }} />}
                          </span>
                        </div>
                        <div>
                          <div className="text-[13.5px] font-semibold">{r.label}</div>
                          <div className="text-[11px] opacity-70">{r.caption}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ToS */}
              <div>
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <span className="mt-0.5 w-4 h-4 rounded-md hairline grid place-items-center shrink-0"
                    style={{
                      background: tos ? 'var(--primary)' : '#fff',
                      borderColor: tos ? 'var(--primary)' : errors.tos ? 'var(--rose)' : 'var(--hair)'
                    }}>
                    {tos && <CheckIcon width={12} height={12} style={{ color: '#fff' }} />}
                  </span>
                  <input type="checkbox" checked={tos} onChange={e => setTos(e.target.checked)} className="sr-only" />
                  <span className="text-[12.5px] ink-2 leading-snug">
                    I agree to Eduwork's{' '}
                    <a className="font-medium underline">Terms of Service</a> and{' '}
                    <a className="font-medium underline">Privacy Policy</a>.
                  </span>
                </label>
                {errors.tos && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--rose)' }}>
                    <AlertIcon width={13} height={13} />{errors.tos}
                  </div>
                )}
              </div>

              <button type="submit" disabled={submitting}
                className="shadow-cta text-white font-semibold text-[14px] h-12 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 transition-opacity"
                style={{ background: 'var(--cta)' }}>
                {submitting
                  ? <Spinner />
                  : <><span>Create my account</span><ArrowIcon width={16} height={16} /></>}
              </button>

              <p className="text-center text-[13px] muted">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                  Log in
                </Link>
              </p>

              <SecurityNote />
            </form>
            )}
          </section>
        </div>

        <footer className="mt-4 text-center text-[11.5px] muted font-mono">
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
