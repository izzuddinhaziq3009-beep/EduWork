import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

export const LogoIcon = (p: P) => (
  <svg viewBox="0 0 32 32" fill="none" {...p}>
    <rect x="2" y="2" width="28" height="28" rx="7" fill="currentColor"/>
    <path d="M9 20.5L16 9l7 11.5H17.5L16 18l-1.5 2.5H9z" fill="#fff"/>
    <circle cx="16" cy="22.5" r="1.5" fill="#fff"/>
  </svg>
)

export const MailIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/>
  </svg>
)

export const LockIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 1 1 8 0v3"/>
  </svg>
)

export const UserIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>
  </svg>
)

export const EyeIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)

export const EyeOffIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M3 3l18 18"/><path d="M10.6 6.2A10.4 10.4 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.3 4M6.6 6.6A17.7 17.7 0 0 0 2 12s3.5 6 10 6a10 10 0 0 0 5.2-1.4"/>
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>
  </svg>
)

export const ArrowIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
)

export const CheckIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M5 12.5l4.5 4.5L19 7"/>
  </svg>
)

export const AlertIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>
  </svg>
)

export const ShieldIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 3l9 3v6c0 5-4 9-9 9s-9-4-9-9V6l9-3z"/><path d="M9 12l2 2 4-4"/>
  </svg>
)

export const BadgeIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="9" r="5"/><path d="M9 13l-2 8 5-3 5 3-2-8"/>
  </svg>
)

export const BuildingIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>
  </svg>
)

export const GoogleIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3-3A10 10 0 0 0 2.5 8.8l3.5 2.7A6 6 0 0 1 12 5z"/>
    <path fill="#4285F4" d="M22 12c0-.8-.1-1.5-.3-2.3H12v4.5h5.6a4.8 4.8 0 0 1-2.1 3.1l3.3 2.6c2-1.8 3.2-4.5 3.2-7.9z"/>
    <path fill="#FBBC05" d="M6 13.5A6 6 0 0 1 5.7 12 6 6 0 0 1 6 10.5l-3.5-2.7A10 10 0 0 0 2 12c0 1.6.4 3.1 1 4.5l3-3z"/>
    <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2.1 1-3.4 1a6 6 0 0 1-6-4.5l-3 3A10 10 0 0 0 12 22z"/>
  </svg>
)

export const GithubIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.14-1.1-1.44-1.1-1.44-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.9.83.1-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.9-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/>
  </svg>
)
