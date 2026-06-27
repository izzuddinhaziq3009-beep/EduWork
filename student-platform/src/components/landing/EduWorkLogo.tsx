interface Props {
  size?: number
}

// Same mark used in BrandPanel (login/signup) and the app's loading screen.
export function EduWorkLogo({ size = 32 }: Props) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" aria-hidden>
      <rect x="2" y="2" width="28" height="28" rx="7" fill="#FFFFFF" />
      <path d="M9 20.5L16 9l7 11.5H17.5L16 18l-1.5 2.5H9z" fill="#0F4C5C" />
      <circle cx="16" cy="22.5" r="1.5" fill="#0F4C5C" />
    </svg>
  )
}
