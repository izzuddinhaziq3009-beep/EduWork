import { supabase } from './supabase'
import { logActivity } from '@/utils/activityLog'
import type { Profile, MentorshipRequest } from '@/types'

type MrInsert = { student_id: string; mentor_id: string; message: string }
type MrBuilder = {
  insert(data: MrInsert): { select(): { single(): Promise<{ data: unknown; error: Error | null }> } }
}
function mrTable() { return supabase.from('mentorship_requests') as unknown as MrBuilder }

export async function getAvailableMentors(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'mentor')
    .order('full_name')
  if (error) throw error
  return (data ?? []) as unknown as Profile[]
}

export async function getMentorProfile(mentorId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', mentorId)
    .eq('role', 'mentor')
    .single()
  if (error) throw error
  return data as unknown as Profile
}

export async function sendMentorshipRequest(
  studentId: string,
  mentorId: string,
  message: string,
): Promise<MentorshipRequest> {
  const { data, error } = await mrTable()
    .insert({ student_id: studentId, mentor_id: mentorId, message })
    .select()
    .single()
  if (error) throw error
  const { data: mentor } = await supabase.from('profiles').select('full_name').eq('id', mentorId).single()
  const mentorName = (mentor as { full_name: string } | null)?.full_name ?? 'a mentor'
  await logActivity(studentId, 'mentorship_request', `Sent mentorship request to ${mentorName}`)
  return data as unknown as MentorshipRequest
}

export async function getStudentRequests(studentId: string): Promise<MentorshipRequest[]> {
  const { data, error } = await supabase
    .from('mentorship_requests')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as MentorshipRequest[]
}

export async function getStudentMentor(studentId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('mentorship_requests')
    .select('mentor_id')
    .eq('student_id', studentId)
    .eq('status', 'accepted')
    .single()
  if (!data) return null
  const { data: mentor } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', (data as { mentor_id: string }).mentor_id)
    .single()
  return (mentor ?? null) as unknown as Profile | null
}
