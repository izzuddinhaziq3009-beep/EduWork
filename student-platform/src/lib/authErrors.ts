// Supabase AuthError has an optional `code` field alongside the inherited `message`.
interface MaybeAuthError {
  code?: string
  message?: string
}

const MESSAGES = {
  invalidCredentials: 'Incorrect email or password. Please try again.',
  emailNotConfirmed:  'Please confirm your email address before logging in. Check your inbox for the confirmation link.',
  userAlreadyExists:  'An account with this email already exists. Try logging in instead.',
  weakPassword:       'Your password is too weak. Use at least 8 characters with a mix of letters, numbers, or symbols.',
  invalidEmail:       'Please enter a valid email address.',
  signupDisabled:     'Sign-ups are currently disabled. Please contact support.',
  rateLimit:          'Too many attempts. Please wait a moment and try again.',
  linkExpired:        'This link has expired. Please request a new one.',
  generic:            'Something went wrong. Please try again.',
} as const

export function getAuthErrorMessage(error: unknown): string {
  if (!error) return MESSAGES.generic

  const err = error as MaybeAuthError
  const code = err.code ?? ''
  const msg  = typeof err.message === 'string' ? err.message : ''

  // ── Code-first (most stable across Supabase versions) ──────────────────────
  switch (code) {
    case 'invalid_credentials':
      return MESSAGES.invalidCredentials
    case 'email_not_confirmed':
      return MESSAGES.emailNotConfirmed
    case 'user_already_exists':
      return MESSAGES.userAlreadyExists
    case 'weak_password':
      return MESSAGES.weakPassword
    case 'validation_failed':
      return MESSAGES.invalidEmail
    case 'signup_disabled':
      return MESSAGES.signupDisabled
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return MESSAGES.rateLimit
    case 'otp_expired':
      return MESSAGES.linkExpired
  }

  // ── Message substring fallback ──────────────────────────────────────────────
  if (!msg) return MESSAGES.generic

  const lower = msg.toLowerCase()

  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return MESSAGES.invalidCredentials
  }
  if (lower.includes('email not confirmed')) {
    return MESSAGES.emailNotConfirmed
  }
  if (lower.includes('user already registered') || lower.includes('already registered')) {
    return MESSAGES.userAlreadyExists
  }
  if (lower.includes('password should be') || lower.includes('too weak') || lower.includes('weak_password')) {
    return MESSAGES.weakPassword
  }
  if (lower.includes('invalid email') || lower.includes('unable to validate email')) {
    return MESSAGES.invalidEmail
  }
  if (lower.includes('signups not allowed') || lower.includes('sign-ups are not allowed')) {
    return MESSAGES.signupDisabled
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return MESSAGES.rateLimit
  }
  if (lower.includes('token has expired') || lower.includes('otp has expired') || lower.includes('link has expired')) {
    return MESSAGES.linkExpired
  }

  // Preserve application-level messages that are already user-friendly
  // (e.g. the "awaiting admin approval" message thrown by signIn in authStore)
  if (lower.includes('awaiting admin approval')) {
    return msg
  }

  return MESSAGES.generic
}
