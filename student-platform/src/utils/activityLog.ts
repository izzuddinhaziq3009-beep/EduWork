import { supabase } from '@/services/supabase'

export async function logActivity(userId: string, action: string, description: string): Promise<void> {
  try {
    await supabase.from('activity_logs').insert({ user_id: userId, action, description })
  } catch {
    // Logging failures must never break the calling operation
  }
}
