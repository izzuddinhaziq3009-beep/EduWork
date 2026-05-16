import { create } from 'zustand'
import { supabase } from '@/services/supabase'
import type { Profile, UserRole } from '@/types'

async function fetchProfile(id: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (error && error.code !== 'PGRST116') {
    console.warn('[fetchProfile] unexpected error:', error.message)
  }
  return (data ?? null) as Profile | null
}

// If the DB trigger never created a profile (e.g. old account / trigger failure),
// create it from the metadata Supabase stored during signup.
async function ensureProfile(
  userId: string,
  email: string,
  metadata: Record<string, unknown>,
): Promise<Profile | null> {
  const role = (metadata?.role as UserRole | undefined) ?? 'student'
  const fullName = (metadata?.full_name as string | undefined) ?? ''
  await supabase
    .from('profiles')
    .upsert({ id: userId, email, full_name: fullName, role }, { onConflict: 'id' })
  return fetchProfile(userId)
}

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

      // The handle_new_user trigger creates the profile automatically.
      // Only fetch the profile if we already have a live session
      // (i.e. email confirmation is disabled in the Supabase project).
      if (data.session) {
        const profile = await fetchProfile(data.user.id)

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
