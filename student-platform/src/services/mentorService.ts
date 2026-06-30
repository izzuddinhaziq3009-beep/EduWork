import { supabase } from './supabase'
import { logActivity } from '@/utils/activityLog'
import type { Profile, ProjectSubmission, Project, MentorFeedback, MentorshipRequest } from '@/types'

// Narrow builders for tables whose Insert/Update/Upsert resolves to `never` ─────
type MfUpsert = { submission_id: string; mentor_id: string; student_id: string; feedback_text: string; status: 'approved' | 'revision_requested' }
type MfBuilder = { upsert(d: MfUpsert, o: { onConflict: string }): Promise<{ error: Error | null }> }
function mfTable() { return supabase.from('mentor_feedback') as unknown as MfBuilder }

type PsStatusUpdate = { status: 'submitted' | 'reviewing' | 'approved' | 'revision_requested' }
// .update().eq() alone returns 0 affected rows *without an error* if RLS silently
// filters the row out — requesting an exact count lets callers detect that
// without depending on the SELECT policy (unlike chaining .select() to read the row back).
type PsEqWithCount = { eq(c: string, v: string): Promise<{ error: Error | null; count: number | null }> }
type PsUpdateBuilder = { update(d: PsStatusUpdate, opts: { count: 'exact' }): PsEqWithCount }
function psUpdateTable() { return supabase.from('project_submissions') as unknown as PsUpdateBuilder }

type NotifInsert = { user_id: string; title: string; message: string; type: string }
type NotifBuilder = { insert(d: NotifInsert): Promise<{ error: Error | null }> }
function notifTable() { return supabase.from('notifications') as unknown as NotifBuilder }

type MrStatusUpdate = { status: 'pending' | 'accepted' | 'rejected' }
type MrUpdateBuilder = { update(d: MrStatusUpdate): { eq(c: string, v: string): Promise<{ error: Error | null }> } }
function mrUpdateTable() { return supabase.from('mentorship_requests') as unknown as MrUpdateBuilder }

export interface MentorDashboardStats {
  pendingReviews: number
  pendingRequests: number
  activeMentees: number
}

export interface SubmissionWithContext {
  submission: ProjectSubmission
  project: Project
  student: Profile
  feedback: MentorFeedback | null
}

export interface MenteeWithRequest {
  student: Profile
  request: MentorshipRequest
}

// ── Dashboard stats ────────────────────────────────────────────────────────

export async function getMentorDashboardStats(mentorId: string): Promise<MentorDashboardStats> {
  // Get accepted mentee IDs
  const { data: accepted } = await supabase
    .from('mentorship_requests')
    .select('student_id')
    .eq('mentor_id', mentorId)
    .eq('status', 'accepted')

  const menteeIds = ((accepted ?? []) as { student_id: string }[]).map(r => r.student_id)

  const [{ count: pendingReviews }, { count: pendingRequests }, { count: activeMentees }] =
    await Promise.all([
      menteeIds.length > 0
        ? supabase.from('project_submissions')
            .select('*', { count: 'exact', head: true })
            .in('student_id', menteeIds)
            .in('status', ['submitted', 'reviewing'])
        : Promise.resolve({ count: 0 }),
      supabase.from('mentorship_requests')
        .select('*', { count: 'exact', head: true })
        .eq('mentor_id', mentorId)
        .eq('status', 'pending'),
      supabase.from('mentorship_requests')
        .select('*', { count: 'exact', head: true })
        .eq('mentor_id', mentorId)
        .eq('status', 'accepted'),
    ])

  return {
    pendingReviews:  pendingReviews  ?? 0,
    pendingRequests: pendingRequests ?? 0,
    activeMentees:   activeMentees   ?? 0,
  }
}

// ── Submissions ────────────────────────────────────────────────────────────

async function buildSubmissionContext(
  submissions: ProjectSubmission[],
): Promise<SubmissionWithContext[]> {
  if (submissions.length === 0) return []

  const projectIds = [...new Set(submissions.map(s => s.project_id))]
  const studentIds = [...new Set(submissions.map(s => s.student_id))]
  const submissionIds = submissions.map(s => s.id)

  const [{ data: projects }, { data: students }, { data: feedbacks }] = await Promise.all([
    supabase.from('projects').select('*').in('id', projectIds),
    supabase.from('profiles').select('*').in('id', studentIds),
    supabase.from('mentor_feedback').select('*').in('submission_id', submissionIds),
  ])

  const projectMap  = Object.fromEntries(((projects  ?? []) as unknown as Project[]).map(p => [p.id, p]))
  const studentMap  = Object.fromEntries(((students  ?? []) as unknown as Profile[]).map(p => [p.id, p]))
  const feedbackMap = Object.fromEntries(((feedbacks ?? []) as unknown as MentorFeedback[]).map(f => [f.submission_id, f]))

  return submissions
    .filter(s => projectMap[s.project_id] && studentMap[s.student_id])
    .map(s => ({
      submission: s,
      project:    projectMap[s.project_id],
      student:    studentMap[s.student_id],
      feedback:   feedbackMap[s.id] ?? null,
    }))
}

export async function getMentorSubmissions(mentorId: string): Promise<SubmissionWithContext[]> {
  const { data: accepted } = await supabase
    .from('mentorship_requests')
    .select('student_id')
    .eq('mentor_id', mentorId)
    .eq('status', 'accepted')

  const menteeIds = ((accepted ?? []) as { student_id: string }[]).map(r => r.student_id)
  if (menteeIds.length === 0) return []

  const { data } = await supabase
    .from('project_submissions')
    .select('*')
    .in('student_id', menteeIds)
    .order('submitted_at', { ascending: false })

  return buildSubmissionContext((data ?? []) as unknown as ProjectSubmission[])
}

export async function getSubmissionDetail(submissionId: string): Promise<SubmissionWithContext | null> {
  const { data } = await supabase
    .from('project_submissions')
    .select('*')
    .eq('id', submissionId)
    .single()

  if (!data) return null
  const results = await buildSubmissionContext([data as unknown as ProjectSubmission])
  return results[0] ?? null
}

// ── Feedback ───────────────────────────────────────────────────────────────

export async function submitFeedback(
  submissionId: string,
  mentorId: string,
  studentId: string,
  feedbackText: string,
  status: 'approved' | 'revision_requested',
): Promise<void> {
  const { error: feedbackError } = await mfTable().upsert(
    { submission_id: submissionId, mentor_id: mentorId, student_id: studentId, feedback_text: feedbackText, status },
    { onConflict: 'submission_id' },
  )
  if (feedbackError) throw feedbackError

  const { error: statusError, count } = await psUpdateTable().update({ status }, { count: 'exact' }).eq('id', submissionId)
  if (statusError) throw statusError
  if (!count) throw new Error("Couldn't update the submission status — you may not have permission to review this student's work.")

  await notifTable().insert({
    user_id: studentId,
    title:   status === 'approved' ? 'Project approved!' : 'Revision requested',
    message: status === 'approved'
      ? 'Your project submission has been approved by your mentor.'
      : 'Your mentor has requested revisions on your project submission.',
    type: 'feedback',
  })
  const { data: submission } = await supabase.from('project_submissions').select('project_id').eq('id', submissionId).single()
  const projectId = (submission as { project_id: string } | null)?.project_id
  const { data: project } = projectId
    ? await supabase.from('projects').select('title').eq('id', projectId).single()
    : { data: null }
  const title = (project as { title: string } | null)?.title ?? 'a submission'
  await logActivity(mentorId, 'feedback_given', `Gave feedback on ${title}`)
}

// ── Mentorship requests ────────────────────────────────────────────────────

export async function getMentorshipRequests(mentorId: string): Promise<Array<MentorshipRequest & { student: Profile }>> {
  const { data } = await supabase
    .from('mentorship_requests')
    .select('*')
    .eq('mentor_id', mentorId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (!data?.length) return []

  const requests = (data ?? []) as unknown as MentorshipRequest[]
  const studentIds = requests.map(r => r.student_id)
  const { data: students } = await supabase.from('profiles').select('*').in('id', studentIds)
  const studentMap = Object.fromEntries(((students ?? []) as unknown as Profile[]).map(p => [p.id, p]))

  return requests.map(r => ({ ...r, student: studentMap[r.student_id] })).filter(r => r.student)
}

export async function acceptRequest(requestId: string, studentId: string): Promise<void> {
  await mrUpdateTable().update({ status: 'accepted' }).eq('id', requestId)
  await notifTable().insert({
    user_id: studentId,
    title:   'Mentorship request accepted!',
    message: 'Your mentorship request has been accepted. You can now message your mentor.',
    type:    'mentorship',
  })
  const { data: request } = await supabase.from('mentorship_requests').select('mentor_id').eq('id', requestId).single()
  const mentorId = (request as { mentor_id: string } | null)?.mentor_id
  const { data: mentor } = mentorId
    ? await supabase.from('profiles').select('full_name').eq('id', mentorId).single()
    : { data: null }
  const mentorName = (mentor as { full_name: string } | null)?.full_name ?? 'a mentor'
  await logActivity(studentId, 'mentorship_accepted', `${mentorName} accepted your mentorship request`)
}

export async function rejectRequest(requestId: string, studentId: string): Promise<void> {
  await mrUpdateTable().update({ status: 'rejected' }).eq('id', requestId)
  await notifTable().insert({
    user_id: studentId,
    title:   'Mentorship request update',
    message: 'Your mentorship request was not accepted at this time.',
    type:    'mentorship',
  })
}

export async function getAcceptedMentees(mentorId: string): Promise<MenteeWithRequest[]> {
  const { data } = await supabase
    .from('mentorship_requests')
    .select('*')
    .eq('mentor_id', mentorId)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false })

  if (!data?.length) return []

  const requests = (data ?? []) as unknown as MentorshipRequest[]
  const studentIds = requests.map(r => r.student_id)
  const { data: students } = await supabase.from('profiles').select('*').in('id', studentIds)
  const studentMap = Object.fromEntries(((students ?? []) as unknown as Profile[]).map(p => [p.id, p]))

  return requests
    .map(r => ({ student: studentMap[r.student_id], request: r }))
    .filter(r => r.student)
}

export async function getMentorStudents(mentorId: string): Promise<Profile[]> {
  const mentees = await getAcceptedMentees(mentorId)
  return mentees.map(m => m.student)
}
