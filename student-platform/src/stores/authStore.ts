import { create } from 'zustand'
import { supabase } from '@/services/supabase'
import type { Profile, UserRole } from '@/types'

// Narrow builder bypasses Supabase's `never` upsert inference for profiles
type ProfileUpsert = { id: string; email: string; full_name: string; role: UserRole; is_approved: boolean }
type ProfileBuilder = { upsert(d: ProfileUpsert, opts: { onConflict: string }): Promise<{ error: Error | null }> }
function profileTable() { return supabase.from('profiles') as unknown as ProfileBuilder }

async function fetchProfile(id: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (error && error.code !== 'PGRST116') {
    console.warn('[fetchProfile] unexpected error:', error.message)
  }
  return (data ?? null) as Profile | null
}

// The DB trigger that normally creates a profile row on signup has proven
// unreliable for some accounts (intermittent failures unrelated to role or
// the approval feature — see project notes). This fallback is the actual
// primary path now, not just a rare-edge-case backstop: it runs whenever a
// profile is missing, and is solely responsible for correctly setting
// is_approved (mentor/company start false; everyone else starts true).
async function ensureProfile(
  userId: string,
  email: string,
  metadata: Record<string, unknown>,
): Promise<Profile | null> {
  const role = (metadata?.role as UserRole | undefined) ?? 'student'
  const fullName = (metadata?.full_name as string | undefined) ?? ''
  const isApproved = !(role === 'mentor' || role === 'company')
  await profileTable().upsert({ id: userId, email, full_name: fullName, role, is_approved: isApproved }, { onConflict: 'id' })
  return fetchProfile(userId)
}

// Mentor/company accounts need admin approval before they can use the app.
// Students and admins are never gated.
function needsApproval(role: UserRole, profile: Profile | null): boolean {
  return (role === 'mentor' || role === 'company') && profile?.is_approved === false
}

type NotifInsert = { user_id: string; title: string; message: string; type: 'system' }
type NotifBuilder = { insert(d: NotifInsert): Promise<{ error: Error | null }> }
function notifTable() { return supabase.from('notifications') as unknown as NotifBuilder }

// Tell every admin a new mentor/company signup needs their review. Best-effort —
// a notification failure must never block the signup itself.
async function notifyAdminsOfPendingApproval(name: string, email: string, role: UserRole): Promise<void> {
  try {
    const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin')
    const list = (admins ?? []) as { id: string }[]
    await Promise.all(list.map(a => notifTable().insert({
      user_id: a.id,
      title: `New ${role} awaiting approval`,
      message: `${name} (${email}) signed up as a ${role} and needs your approval before they can log in.`,
      type: 'system',
    })))
  } catch {
    // Non-critical — admins can still see pending accounts in User Management.
  }
}

// Thrown by signUp when a brand-new mentor/company account is pending —
// the signup page checks for this exact message to show a distinct
// "awaiting approval" panel instead of a generic error.
export const PENDING_APPROVAL_MESSAGE = 'PENDING_APPROVAL'

interface AuthState {
  user: { id: string; email: string } | null
  profile: Profile | null
  role: UserRole | null
  loading: boolean
  error: string | null
}

interface AuthActions {
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  profile: null,
  role: null,
  loading: true,
  error: null,

  clearError: () => set({ error: null }),

  checkAuth: async () => {
    set({ loading: true })
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        set({ user: null, profile: null, role: null, loading: false })
        return
      }
      const u = session.user
      let profile = await fetchProfile(u.id)
      if (!profile) {
        profile = await ensureProfile(u.id, u.email!, u.user_metadata ?? {})
      }
      // Final fallback: read role straight from auth metadata
      const role: UserRole =
        profile?.role ?? (u.user_metadata?.role as UserRole | undefined) ?? 'student'

      // A still-pending mentor/company account (or one a previous session
      // cached before approval) must not stay signed in.
      if (needsApproval(role, profile)) {
        await supabase.auth.signOut()
        set({ user: null, profile: null, role: null, loading: false })
        return
      }

      set({
        user: { id: u.id, email: u.email! },
        profile,
        role,
        loading: false,
      })
    } catch {
      set({ user: null, profile: null, role: null, loading: false })
    }
  },

  signUp: async (email, password, fullName, role) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
        },
      })
      if (error) throw error
      if (!data.user) throw new Error('Signup failed — no user returned.')

      // The handle_new_user DB trigger is supposed to create the profile
      // automatically, but has proven unreliable — ensureProfile is the
      // real fallback here, not a rare edge case, so it must run whenever
      // the trigger didn't leave a row behind.
      if (data.session) {
        let profile = await fetchProfile(data.user.id)
        if (!profile) {
          profile = await ensureProfile(data.user.id, data.user.email!, { full_name: fullName, role })
        }

        // New mentor/company self-signups start unapproved — don't let
        // them stay signed in until an admin approves.
        if (needsApproval(role, profile)) {
          await notifyAdminsOfPendingApproval(fullName, email, role)
          await supabase.auth.signOut()
          set({ user: null, profile: null, role: null, loading: false })
          throw new Error(PENDING_APPROVAL_MESSAGE)
        }

        set({
          user: { id: data.user.id, email: data.user.email! },
          profile,
          role: profile?.role ?? role,
          loading: false,
        })
      } else {
        // Email confirmation is required — no session yet.
        // Store minimal state so the UI can show a "check your inbox" message.
        set({
          user: { id: data.user.id, email: data.user.email! },
          profile: null,
          role,
          loading: false,
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Signup failed.'
      set({ loading: false, error: msg })
      throw err
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (!data.user) throw new Error('Login failed.')

      const u = data.user
      let profile = await fetchProfile(u.id)

      // Profile missing (trigger may have failed at signup) — recreate from metadata
      if (!profile) {
        profile = await ensureProfile(u.id, u.email!, u.user_metadata ?? {})
      }

      // Role: profile row → auth metadata → null
      const role: UserRole =
        profile?.role ?? (u.user_metadata?.role as UserRole | undefined) ?? 'student'

      if (needsApproval(role, profile)) {
        await supabase.auth.signOut()
        set({ user: null, profile: null, role: null, loading: false })
        throw new Error(
          `Your ${role} account is awaiting admin approval. You'll be able to log in once it's approved.`,
        )
      }

      set({
        user: { id: u.id, email: u.email! },
        profile,
        role,
        loading: false,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed.'
      set({ loading: false, error: msg })
      throw err
    }
  },

  // Google sign-in is student-only: there's no role picker in the OAuth flow,
  // so new accounts created this way fall through to ensureProfile's 'student'
  // default (no `role` key in Google's metadata). Existing mentor/company/admin
  // accounts always go through the email/password form instead.
  signInWithGoogle: async () => {
    set({ error: null })
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) {
      set({ error: error.message })
      throw error
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, role: null, loading: false, error: null })
  },
}))

// Keep store in sync with Supabase auth events.
// INITIAL_SESSION fires on page load — if there's no session we can stop loading immediately
// rather than waiting for the checkAuth useEffect to run.
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
    useAuthStore.setState({ user: null, profile: null, role: null, loading: false })
  }
})

// supabase-js's built-in autoRefreshToken relies on a timer scheduled ahead of
// expiry, but browsers throttle/suspend timers in backgrounded tabs — so a tab
// left idle past the access token's lifetime (1hr by default) can come back
// with a stale token. Requests then get silently filtered by RLS (auth.uid()
// resolves to null) instead of failing loudly, which looks like a permissions
// bug rather than an auth one. Forcing a session check on tab-visible/focus
// triggers supabase-js to refresh it before the next request needs it.
if (typeof document !== 'undefined') {
  const refreshIfStale = () => { void supabase.auth.getSession() }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refreshIfStale()
  })
  window.addEventListener('focus', refreshIfStale)
}
