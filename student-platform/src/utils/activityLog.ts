import { supabase } from '@/services/supabase'
import type { ActivityLog } from '@/types'

// Narrow builder bypasses Supabase's `never` insert inference for activity_logs
type AlInsert = { user_id: string; action: string; description: string }
type AlBuilder = { insert(d: AlInsert): Promise<{ error: Error | null }> }
function alTable() { return supabase.from('activity_logs') as unknown as AlBuilder }

export async function logActivity(userId: string, action: string, description: string): Promise<void> {
  try {
    await alTable().insert({ user_id: userId, action, description })
  } catch {
    // Logging failures must never break the calling operation
  }
}

export async function getUserActivity(userId: string, limit = 8): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as unknown as ActivityLog[]
}
