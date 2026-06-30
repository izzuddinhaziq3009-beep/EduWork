import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ok, queueFromResults } from '@/test/supabaseMock'
import type { Profile } from '@/types'

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  signInWithOAuth: vi.fn(),
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  from: vi.fn(),
}))

vi.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      signInWithPassword: mocks.signInWithPassword,
      signUp: mocks.signUp,
      signOut: mocks.signOut,
      signInWithOAuth: mocks.signInWithOAuth,
      onAuthStateChange: mocks.onAuthStateChange,
    },
    from: mocks.from,
  },
}))

const { useAuthStore, needsApproval, PENDING_APPROVAL_MESSAGE } = await import('./authStore')

const INITIAL_STATE = { user: null, profile: null, role: null, loading: true, error: null }

beforeEach(() => {
  mocks.getSession.mockReset()
  mocks.signInWithPassword.mockReset()
  mocks.signUp.mockReset()
  mocks.from.mockReset()
  mocks.signOut.mockReset()
  mocks.signOut.mockResolvedValue({ error: null })
  useAuthStore.setState(INITIAL_STATE)
})

describe('needsApproval', () => {
  it('returns false for students regardless of approval state', () => {
    expect(needsApproval('student', { is_approved: false } as unknown as Profile)).toBe(false)
  })

  it('returns false for admins', () => {
    expect(needsApproval('admin', { is_approved: false } as unknown as Profile)).toBe(false)
  })

  it('returns true for an unapproved mentor', () => {
    expect(needsApproval('mentor', { is_approved: false } as unknown as Profile)).toBe(true)
  })

  it('returns true for an unapproved company', () => {
    expect(needsApproval('company', { is_approved: false } as unknown as Profile)).toBe(true)
  })

  it('returns false for an approved mentor', () => {
    expect(needsApproval('mentor', { is_approved: true } as unknown as Profile)).toBe(false)
  })

  it('returns false when there is no profile yet (nothing to gate on)', () => {
    expect(needsApproval('mentor', null)).toBe(false)
  })
})

describe('signIn', () => {
  it('logs in an approved student and populates store state', async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'u1', email: 'student@test.com', user_metadata: {} } },
      error: null,
    })
    queueFromResults(mocks.from, [
      ok({ id: 'u1', role: 'student', is_approved: true, full_name: 'Stu Dent' }),
    ])
    await useAuthStore.getState().signIn('student@test.com', 'pw')
    const state = useAuthStore.getState()
    expect(state.user).toEqual({ id: 'u1', email: 'student@test.com' })
    expect(state.role).toBe('student')
    expect(state.error).toBeNull()
  })

  it('blocks login for an unapproved mentor and signs them back out', async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'u2', email: 'mentor@test.com', user_metadata: {} } },
      error: null,
    })
    queueFromResults(mocks.from, [
      ok({ id: 'u2', role: 'mentor', is_approved: false, full_name: 'Mentor' }),
    ])
    await expect(useAuthStore.getState().signIn('mentor@test.com', 'pw'))
      .rejects.toThrow(/awaiting admin approval/)
    expect(mocks.signOut).toHaveBeenCalled()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('surfaces invalid-credential errors and sets store error state', async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: new Error('Invalid login credentials'),
    })
    await expect(useAuthStore.getState().signIn('x@test.com', 'wrong'))
      .rejects.toThrow('Invalid login credentials')
    expect(useAuthStore.getState().error).toBe('Invalid login credentials')
  })

  it('falls back to creating a profile when none exists yet', async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'u3', email: 's@test.com', user_metadata: { role: 'student', full_name: 'New Stu' } } },
      error: null,
    })
    queueFromResults(mocks.from, [
      ok(null),
      ok(null),
      ok({ id: 'u3', role: 'student', is_approved: true, full_name: 'New Stu' }),
    ])
    await useAuthStore.getState().signIn('s@test.com', 'pw')
    expect(useAuthStore.getState().role).toBe('student')
  })
})

describe('signUp', () => {
  it('logs a student straight in when a session comes back immediately', async () => {
    mocks.signUp.mockResolvedValue({
      data: { user: { id: 'u1', email: 's@test.com' }, session: {} },
      error: null,
    })
    queueFromResults(mocks.from, [
      ok({ id: 'u1', role: 'student', is_approved: true, full_name: 'New Student' }),
    ])
    await useAuthStore.getState().signUp('s@test.com', 'pw', 'New Student', 'student')
    const state = useAuthStore.getState()
    expect(state.user).toEqual({ id: 'u1', email: 's@test.com' })
    expect(state.role).toBe('student')
  })

  it('throws the pending-approval sentinel for a new mentor signup and signs them out', async () => {
    mocks.signUp.mockResolvedValue({
      data: { user: { id: 'u2', email: 'm@test.com' }, session: {} },
      error: null,
    })
    queueFromResults(mocks.from, [
      ok({ id: 'u2', role: 'mentor', is_approved: false, full_name: 'New Mentor' }),
      ok([]),
    ])
    await expect(useAuthStore.getState().signUp('m@test.com', 'pw', 'New Mentor', 'mentor'))
      .rejects.toThrow(PENDING_APPROVAL_MESSAGE)
    expect(mocks.signOut).toHaveBeenCalled()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('sets minimal state when email confirmation is required (no session yet)', async () => {
    mocks.signUp.mockResolvedValue({
      data: { user: { id: 'u3', email: 'c@test.com' }, session: null },
      error: null,
    })
    await useAuthStore.getState().signUp('c@test.com', 'pw', 'Conf User', 'student')
    const state = useAuthStore.getState()
    expect(state.user).toEqual({ id: 'u3', email: 'c@test.com' })
    expect(state.profile).toBeNull()
    expect(state.role).toBe('student')
  })
})

describe('checkAuth', () => {
  it('clears state when there is no active session', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } })
    await useAuthStore.getState().checkAuth()
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.loading).toBe(false)
  })

  it('restores an approved user from an existing session', async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: { user: { id: 'u1', email: 's@test.com', user_metadata: {} } } },
    })
    queueFromResults(mocks.from, [
      ok({ id: 'u1', role: 'student', is_approved: true, full_name: 'Stu' }),
    ])
    await useAuthStore.getState().checkAuth()
    const state = useAuthStore.getState()
    expect(state.user).toEqual({ id: 'u1', email: 's@test.com' })
    expect(state.role).toBe('student')
  })

  it('signs out a cached session whose profile is no longer approved', async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: { user: { id: 'u2', email: 'm@test.com', user_metadata: {} } } },
    })
    queueFromResults(mocks.from, [
      ok({ id: 'u2', role: 'mentor', is_approved: false, full_name: 'Mentor' }),
    ])
    await useAuthStore.getState().checkAuth()
    expect(mocks.signOut).toHaveBeenCalled()
    expect(useAuthStore.getState().user).toBeNull()
  })
})
