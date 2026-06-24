import { supabase } from '@/services/supabase'

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
