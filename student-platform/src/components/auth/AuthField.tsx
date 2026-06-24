import { useState } from 'react'
import { AlertIcon, LockIcon, EyeIcon, EyeOffIcon } from './AuthIcons'
import type { ReactElement, ReactNode, SVGProps } from 'react'

type IconComponent = (p: SVGProps<SVGSVGElement>) => ReactElement

interface FieldProps {
  Icon?: IconComponent
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
  error?: string
  rightSlot?: ReactNode
  name?: string
}

export function AuthField({ Icon, label, type = 'text', value, onChange, placeholder, autoComplete, error, rightSlot, name }: FieldProps) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[12.5px] font-medium ink-2">{label}</span>
        {rightSlot}
      </div>
      <div className={`hairline rounded-xl flex items-center gap-3 px-3.5 h-12 bg-[#FBFAF5] transition-colors ${error ? 'border-[color:var(--rose)] bg-[var(--rose-soft)]' : 'focus-within:border-[color:var(--primary)]'}`}>
        {Icon && <Icon width={18} height={18} className="text-[color:var(--muted)] shrink-0" />}
        <input
          type={type} name={name} value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder} autoComplete={autoComplete}
          className="bg-transparent outline-none flex-1 text-[14px] placeholder:text-[color:var(--muted)]"
        />
      </div>
      {error && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--rose)' }}>
          <AlertIcon width={13} height={13} />{error}
        </div>
      )}
    </label>
  )
}

interface PasswordFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  name?: string
  hint?: string
  rightSlot?: ReactNode
  autoComplete?: string
}

export function PasswordField({ label, value, onChange, error, name, hint, rightSlot, autoComplete = 'current-password' }: PasswordFieldProps) {
  const [show, setShow] = useState(false)
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[12.5px] font-medium ink-2">{label}</span>
        {rightSlot}
      </div>
      <div className={`hairline rounded-xl flex items-center gap-3 px-3.5 h-12 bg-[#FBFAF5] transition-colors ${error ? 'border-[color:var(--rose)] bg-[var(--rose-soft)]' : 'focus-within:border-[color:var(--primary)]'}`}>
        <LockIcon width={18} height={18} className="text-[color:var(--muted)] shrink-0" />
        <input
          type={show ? 'text' : 'password'} name={name} value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={show ? 'your-password' : '••••••••••'}
          autoComplete={autoComplete}
          className="bg-transparent outline-none flex-1 text-[14px] placeholder:text-[color:var(--muted)] font-mono tracking-wider"
        />
        <button type="button" onClick={() => setShow(s => !s)}
          className="w-8 h-8 grid place-items-center rounded-lg hover:bg-[var(--hair-2)]">
          {show
            ? <EyeOffIcon width={16} height={16} className="text-[color:var(--ink-2)]" />
            : <EyeIcon width={16} height={16} className="text-[color:var(--ink-2)]" />}
        </button>
      </div>
      {error && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--rose)' }}>
          <AlertIcon width={13} height={13} />{error}
        </div>
      )}
      {hint && !error && <div className="mt-1.5 text-[11.5px] muted">{hint}</div>}
    </label>
  )
}

function passwordStrength(pw: string) {
  if (!pw) return { level: 0, label: '' }
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  const labels = ['Too short', 'Weak', 'Okay', 'Good', 'Strong']
  return { level: s, label: labels[s] }
}

export function StrengthBar({ pw }: { pw: string }) {
  const { level, label } = passwordStrength(pw)
  const colors = ['var(--rose)', 'var(--rose)', 'var(--warn)', 'var(--accent)', 'var(--accent)']
  if (!pw) return null
  return (
    <div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map(i => (
          <span key={i} className="flex-1 h-1 rounded-full"
            style={{ background: i <= level ? colors[level] : 'var(--hair-2)', transition: 'background .2s' }} />
        ))}
      </div>
      <div className="flex items-center justify-between mt-1.5 text-[11px]">
        <span className="muted">8+ chars with number or symbol</span>
        <span className="font-mono font-medium"
          style={{ color: level <= 1 ? 'var(--rose)' : level <= 2 ? 'var(--warn)' : 'var(--accent)' }}>{label}</span>
      </div>
    </div>
  )
}

export { passwordStrength }
