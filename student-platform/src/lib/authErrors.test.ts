import { describe, it, expect } from 'vitest'
import { getAuthErrorMessage } from './authErrors'

function makeError(message: string, code?: string) {
  const err = new Error(message) as Error & { code?: string }
  if (code) err.code = code
  return err
}

describe('getAuthErrorMessage', () => {
  // ── Code-based matching ────────────────────────────────────────────────────

  it('maps invalid_credentials code to the combined credential message', () => {
    expect(getAuthErrorMessage(makeError('Invalid login credentials', 'invalid_credentials')))
      .toBe('Incorrect email or password. Please try again.')
  })

  it('maps user_already_exists code to the account-exists message', () => {
    expect(getAuthErrorMessage(makeError('User already registered', 'user_already_exists')))
      .toBe('An account with this email already exists. Try logging in instead.')
  })

  it('maps email_not_confirmed to the confirmation message, NOT the credential message', () => {
    const result = getAuthErrorMessage(makeError('Email not confirmed', 'email_not_confirmed'))
    expect(result).toBe('Please confirm your email address before logging in. Check your inbox for the confirmation link.')
    expect(result).not.toBe('Incorrect email or password. Please try again.')
  })

  it('maps weak_password code to the strength message', () => {
    expect(getAuthErrorMessage(makeError('Password should be at least 6 characters', 'weak_password')))
      .toBe('Your password is too weak. Use at least 8 characters with a mix of letters, numbers, or symbols.')
  })

  it('maps validation_failed code to the email message', () => {
    expect(getAuthErrorMessage(makeError('validation error', 'validation_failed')))
      .toBe('Please enter a valid email address.')
  })

  it('maps signup_disabled to the disabled message', () => {
    expect(getAuthErrorMessage(makeError('Signups not allowed', 'signup_disabled')))
      .toBe('Sign-ups are currently disabled. Please contact support.')
  })

  it('maps over_request_rate_limit to the rate-limit message', () => {
    expect(getAuthErrorMessage(makeError('Too many requests', 'over_request_rate_limit')))
      .toBe('Too many attempts. Please wait a moment and try again.')
  })

  it('maps over_email_send_rate_limit to the rate-limit message', () => {
    expect(getAuthErrorMessage(makeError('Email rate limit exceeded', 'over_email_send_rate_limit')))
      .toBe('Too many attempts. Please wait a moment and try again.')
  })

  it('maps otp_expired to the link-expired message', () => {
    expect(getAuthErrorMessage(makeError('Token has expired', 'otp_expired')))
      .toBe('This link has expired. Please request a new one.')
  })

  // ── Message substring fallback ─────────────────────────────────────────────

  it('falls back to credential message when message contains "Invalid login credentials"', () => {
    expect(getAuthErrorMessage(new Error('Invalid login credentials')))
      .toBe('Incorrect email or password. Please try again.')
  })

  it('falls back to already-exists message when message contains "User already registered"', () => {
    expect(getAuthErrorMessage(new Error('User already registered')))
      .toBe('An account with this email already exists. Try logging in instead.')
  })

  it('falls back to rate-limit message when message contains "rate limit"', () => {
    expect(getAuthErrorMessage(new Error('over rate limit, please slow down'))).toBe(
      'Too many attempts. Please wait a moment and try again.',
    )
  })

  it('falls back to link-expired message when message contains "Token has expired"', () => {
    expect(getAuthErrorMessage(new Error('Token has expired'))).toBe(
      'This link has expired. Please request a new one.',
    )
  })

  // ── Generic fallback ───────────────────────────────────────────────────────

  it('returns the generic message for an unknown error code', () => {
    expect(getAuthErrorMessage(makeError('some unexpected internal error', 'unknown_code_xyz')))
      .toBe('Something went wrong. Please try again.')
  })

  it('returns the generic message for a plain unknown error', () => {
    expect(getAuthErrorMessage(new Error('some internal server error')))
      .toBe('Something went wrong. Please try again.')
  })

  it('returns the generic message for null', () => {
    expect(getAuthErrorMessage(null)).toBe('Something went wrong. Please try again.')
  })

  it('returns the generic message for a non-Error object', () => {
    expect(getAuthErrorMessage({ status: 500 })).toBe('Something went wrong. Please try again.')
  })

  // ── Application-level passthrough ─────────────────────────────────────────

  it('passes through the awaiting-approval message unchanged', () => {
    const msg = "Your mentor account is awaiting admin approval. You'll be able to log in once it's approved."
    expect(getAuthErrorMessage(new Error(msg))).toBe(msg)
  })
})
