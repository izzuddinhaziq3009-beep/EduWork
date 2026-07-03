import { supabase } from './supabase'

// Bypass Supabase's generated-type overloads for SECURITY DEFINER RPCs.
type UntypedRpc = (fn: string, params?: Record<string, unknown>) => Promise<{ data: unknown; error: Error | null }>
const rpc = supabase.rpc.bind(supabase) as unknown as UntypedRpc

// Marks the current user's own profile row as onboarded.
// Uses a SECURITY DEFINER RPC so no broad UPDATE policy is required on profiles.
export async function markOnboarded(_userId: string): Promise<void> {
  const { error } = await rpc('mark_profile_onboarded')
  if (error) throw error
}
