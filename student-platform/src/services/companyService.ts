import { supabase } from './supabase'
import type { Profile, IndustryChallenge, ChallengeSubmission, ChallengeFeedback, DifficultyLevel } from '@/types'

type EqOne = { eq(c: string, v: string): Promise<{ error: Error | null }> }
type SelectSingle = { select(): { single(): Promise<{ data: unknown; error: Error | null }> } }

// Narrow builder for profiles update (bypass `never` inference)
type ProfileUpdatePayload = Partial<{ full_name: string; company_description: string; company_website: string; company_industry: string }>
type ProfileBuilder = { update(d: ProfileUpdatePayload): EqOne }
function profileTable() { return supabase.from('profiles') as unknown as ProfileBuilder }

// Narrow builder for industry_challenges insert/update (bypass `never` inference)
type IcInsertPayload = {
  company_id: string; title: string; description: string; requirements: string
  difficulty_level: DifficultyLevel; deadline: string; is_approved: boolean; is_active: boolean
}
type IcUpdatePayload = Partial<{
  title: string; description: string; requirements: string
  difficulty_level: DifficultyLevel; deadline: string
  is_approved: boolean; is_active: boolean
  rejection_reason: string | null; rejected_at: string | null
}>
type IcBuilder = { insert(d: IcInsertPayload): SelectSingle; update(d: IcUpdatePayload): EqOne }
function icTable() { return supabase.from('industry_challenges') as unknown as IcBuilder }

// Narrow builder for notifications insert
type NotifInsert = { user_id: string; title: string; message: string; type: string }
type NotifInsertBuilder = { insert(d: NotifInsert): Promise<{ error: Error | null }> }
function notifTable() { return supabase.from('notifications') as unknown as NotifInsertBuilder }

// Narrow builder for challenge_feedback insert
type CfInsert = { submission_id: string; reviewer_id: string; reviewer_type: string; feedback_text: string; rating: number }
type CfBuilder = { insert(d: CfInsert): Promise<{ error: Error | null }> }
function cfTable() { return supabase.from('challenge_feedback') as unknown as CfBuilder }

// Narrow builder for challenge_submissions status update
// .update().eq() alone returns 0 affected rows *without an error* if RLS silently
// filters the row out — requesting an exact count lets callers detect that
// without depending on the SELECT policy (unlike chaining .select() to read the row back).
type CsEqWithCount = { eq(c: string, v: string): Promise<{ error: Error | null; count: number | null }> }
type CsUpdateBuilder = { update(d: { status: string }, opts: { count: 'exact' }): CsEqWithCount }
function csTable() { return supabase.from('challenge_submissions') as unknown as CsUpdateBuilder }

export interface ChallengeWithStats extends IndustryChallenge {
  submissionCount: number
}

export interface SubmissionWithContext {
  submission: ChallengeSubmission
  challenge:  IndustryChallenge
  student:    Profile
  feedback:   ChallengeFeedback | null
}

export interface CompanyDashboardStats {
  totalChallenges:  number
  totalSubmissions: number
  pendingReviews:   number
}

export interface StudentSummary {
  completedModules:   number
  approvedProjects:   number
  completedChallenges: number
}

// ── Company profile ────────────────────────────────────────────────────────

export async function getCompanyProfile(companyId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', companyId)
    .single()
  if (error) throw error
  return data as unknown as Profile
}

export async function updateCompanyProfile(
  companyId: string,
  payload: {
    full_name?: string
    company_description?: string
    company_website?: string
    company_industry?: string
  },
): Promise<void> {
  const { error } = await profileTable().update(payload).eq('id', companyId)
  if (error) throw error
}

// ── Dashboard stats ────────────────────────────────────────────────────────

export async function getCompanyDashboardStats(companyId: string): Promise<CompanyDashboardStats> {
  const { data: challenges } = await supabase
    .from('industry_challenges')
    .select('id')
    .eq('company_id', companyId)

  const challengeIds = ((challenges ?? []) as { id: string }[]).map(c => c.id)

  if (challengeIds.length === 0) {
    return { totalChallenges: 0, totalSubmissions: 0, pendingReviews: 0 }
  }

  const [{ count: totalSubs }, { count: pendingReviews }] = await Promise.all([
    supabase.from('challenge_submissions')
      .select('*', { count: 'exact', head: true })
      .in('challenge_id', challengeIds),
    supabase.from('challenge_submissions')
      .select('*', { count: 'exact', head: true })
      .in('challenge_id', challengeIds)
      .in('status', ['submitted', 'reviewing']),
  ])

  return {
    totalChallenges:  challengeIds.length,
    totalSubmissions: totalSubs    ?? 0,
    pendingReviews:   pendingReviews ?? 0,
  }
}

// ── Challenges ─────────────────────────────────────────────────────────────

export async function getCompanyChallenges(companyId: string): Promise<ChallengeWithStats[]> {
  const { data, error } = await supabase
    .from('industry_challenges')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
  if (error) throw error

  const challenges = (data ?? []) as unknown as IndustryChallenge[]
  if (challenges.length === 0) return []

  // Get submission counts per challenge
  const ids = challenges.map(c => c.id)
  const { data: subs } = await supabase
    .from('challenge_submissions')
    .select('challenge_id')
    .in('challenge_id', ids)

  const countMap: Record<string, number> = {}
  for (const s of (subs ?? []) as { challenge_id: string }[]) {
    countMap[s.challenge_id] = (countMap[s.challenge_id] ?? 0) + 1
  }

  return challenges.map(c => ({ ...c, submissionCount: countMap[c.id] ?? 0 }))
}

export async function getChallengeById(id: string): Promise<IndustryChallenge> {
  const { data, error } = await supabase
    .from('industry_challenges')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as unknown as IndustryChallenge
}

export async function createChallenge(
  companyId: string,
  payload: {
    title: string
    description: string
    requirements: string
    difficulty_level: DifficultyLevel
    deadline: string
  },
): Promise<IndustryChallenge> {
  const { data, error } = await icTable()
    .insert({ company_id: companyId, ...payload, is_approved: false, is_active: true })
    .select().single()
  if (error) throw error
  return data as unknown as IndustryChallenge
}

export async function updateChallenge(
  challengeId: string,
  payload: Partial<{
    title: string
    description: string
    requirements: string
    difficulty_level: DifficultyLevel
    deadline: string
  }>,
): Promise<void> {
  const { error } = await icTable().update(payload).eq('id', challengeId)
  if (error) throw error
}

export async function deleteChallenge(challengeId: string): Promise<void> {
  const { error } = await supabase
    .from('industry_challenges')
    .delete()
    .eq('id', challengeId)
    .eq('is_approved', false)
  if (error) throw error
}

// ── Filtered challenge queries (company view) ──────────────────────────────

export async function getCompanyPendingChallenges(companyId: string): Promise<ChallengeWithStats[]> {
  const { data, error } = await supabase
    .from('industry_challenges')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_approved', false)
    .is('rejection_reason', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return attachSubmissionCounts((data ?? []) as unknown as IndustryChallenge[])
}

export async function getCompanyApprovedChallenges(companyId: string): Promise<ChallengeWithStats[]> {
  const { data, error } = await supabase
    .from('industry_challenges')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return attachSubmissionCounts((data ?? []) as unknown as IndustryChallenge[])
}

export async function getCompanyRejectedChallenges(companyId: string): Promise<ChallengeWithStats[]> {
  const { data, error } = await supabase
    .from('industry_challenges')
    .select('*')
    .eq('company_id', companyId)
    .not('rejection_reason', 'is', null)
    .order('rejected_at', { ascending: false })
  if (error) throw error
  return attachSubmissionCounts((data ?? []) as unknown as IndustryChallenge[])
}

async function attachSubmissionCounts(challenges: IndustryChallenge[]): Promise<ChallengeWithStats[]> {
  if (challenges.length === 0) return []
  const ids = challenges.map(c => c.id)
  const { data: subs } = await supabase
    .from('challenge_submissions')
    .select('challenge_id')
    .in('challenge_id', ids)
  const countMap: Record<string, number> = {}
  for (const s of (subs ?? []) as { challenge_id: string }[]) {
    countMap[s.challenge_id] = (countMap[s.challenge_id] ?? 0) + 1
  }
  return challenges.map(c => ({ ...c, submissionCount: countMap[c.id] ?? 0 }))
}

export async function resubmitChallenge(
  challengeId: string,
  companyName: string,
  challengeTitle: string,
  payload: Partial<{
    title: string; description: string; requirements: string
    difficulty_level: DifficultyLevel; deadline: string
  }>,
): Promise<void> {
  // Update content + clear rejection fields + reset approval
  const { error } = await icTable().update({
    ...payload,
    rejection_reason: null,
    rejected_at:      null,
    is_approved:      false,
    is_active:        false,
  }).eq('id', challengeId)
  if (error) throw error

  // Notify all admins
  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
  for (const admin of (admins ?? []) as { id: string }[]) {
    await notifTable().insert({
      user_id: admin.id,
      title:   'Challenge Resubmitted',
      message: `${companyName} resubmitted "${challengeTitle}" after addressing feedback.`,
      type:    'system',
    })
  }
}

// ── Eligible students (for company messaging) ──────────────────────────────

export async function getCompanyEligibleStudents(companyId: string): Promise<Profile[]> {
  const { data: challenges } = await supabase
    .from('industry_challenges')
    .select('id')
    .eq('company_id', companyId)

  const ids = ((challenges ?? []) as { id: string }[]).map(c => c.id)
  if (ids.length === 0) return []

  const { data: subs } = await supabase
    .from('challenge_submissions')
    .select('student_id')
    .in('challenge_id', ids)

  const studentIds = [...new Set(((subs ?? []) as { student_id: string }[]).map(s => s.student_id))]
  if (studentIds.length === 0) return []

  const { data: profiles } = await supabase.from('profiles').select('*').in('id', studentIds)
  return (profiles ?? []) as unknown as Profile[]
}

// ── Submissions ────────────────────────────────────────────────────────────

async function buildSubmissionContext(submissions: ChallengeSubmission[]): Promise<SubmissionWithContext[]> {
  if (submissions.length === 0) return []

  const challengeIds = [...new Set(submissions.map(s => s.challenge_id))]
  const studentIds   = [...new Set(submissions.map(s => s.student_id))]
  const submissionIds = submissions.map(s => s.id)

  const [{ data: challenges }, { data: students }, { data: feedbacks }] = await Promise.all([
    supabase.from('industry_challenges').select('*').in('id', challengeIds),
    supabase.from('profiles').select('*').in('id', studentIds),
    supabase.from('challenge_feedback').select('*').in('submission_id', submissionIds),
  ])

  const cMap = Object.fromEntries(((challenges ?? []) as unknown as IndustryChallenge[]).map(c => [c.id, c]))
  const sMap = Object.fromEntries(((students   ?? []) as unknown as Profile[]).map(p => [p.id, p]))
  const fMap = Object.fromEntries(((feedbacks  ?? []) as unknown as ChallengeFeedback[]).map(f => [f.submission_id, f]))

  return submissions
    .filter(s => cMap[s.challenge_id] && sMap[s.student_id])
    .map(s => ({ submission: s, challenge: cMap[s.challenge_id], student: sMap[s.student_id], feedback: fMap[s.id] ?? null }))
}

export async function getChallengeSubmissions(challengeId: string): Promise<SubmissionWithContext[]> {
  const { data, error } = await supabase
    .from('challenge_submissions')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('submitted_at', { ascending: false })
  if (error) throw error
  return buildSubmissionContext((data ?? []) as unknown as ChallengeSubmission[])
}

export async function getAllCompanySubmissions(companyId: string): Promise<SubmissionWithContext[]> {
  const { data: challenges } = await supabase
    .from('industry_challenges')
    .select('id')
    .eq('company_id', companyId)

  const ids = ((challenges ?? []) as { id: string }[]).map(c => c.id)
  if (ids.length === 0) return []

  const { data, error } = await supabase
    .from('challenge_submissions')
    .select('*')
    .in('challenge_id', ids)
    .order('submitted_at', { ascending: false })
  if (error) throw error
  return buildSubmissionContext((data ?? []) as unknown as ChallengeSubmission[])
}

export async function getCompanySubmissionDetail(submissionId: string): Promise<SubmissionWithContext | null> {
  const { data } = await supabase
    .from('challenge_submissions')
    .select('*')
    .eq('id', submissionId)
    .single()
  if (!data) return null
  const results = await buildSubmissionContext([data as unknown as ChallengeSubmission])
  return results[0] ?? null
}

export async function getStudentSummary(studentId: string): Promise<StudentSummary> {
  const [{ count: modules }, { count: projects }, { count: challenges }] = await Promise.all([
    supabase.from('student_module_progress')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .eq('completed', true),
    supabase.from('project_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .eq('status', 'approved'),
    // Count all challenge submissions regardless of status, matching the
    // dashboard's challengesAttempted metric (progressService.ts line 64).
    // Filtering by status='completed' produced 0 because that terminal state
    // is rarely reached; the student dashboard counts every submission.
    supabase.from('challenge_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId),
  ])
  return { completedModules: modules ?? 0, approvedProjects: projects ?? 0, completedChallenges: challenges ?? 0 }
}

export async function leaveFeedback(
  submissionId: string,
  reviewerId: string,
  studentId: string,
  feedbackText: string,
  rating: number,
): Promise<void> {
  const { error: feedbackError } = await cfTable().insert({
    submission_id: submissionId,
    reviewer_id:   reviewerId,
    reviewer_type: 'company',
    feedback_text: feedbackText,
    rating,
  })
  if (feedbackError) throw feedbackError

  const { error: statusError, count } = await csTable().update({ status: 'feedback_given' }, { count: 'exact' }).eq('id', submissionId)
  if (statusError) throw statusError
  if (!count) throw new Error("Couldn't update the submission status — you may not have permission to review this submission.")

  await notifTable().insert({
    user_id: studentId,
    title:   'Feedback received on your challenge submission!',
    message: 'A company has reviewed and left feedback on your challenge submission.',
    type:    'challenge',
  })
}

export async function getSubmissionFeedback(submissionId: string): Promise<ChallengeFeedback | null> {
  const { data } = await supabase
    .from('challenge_feedback')
    .select('*')
    .eq('submission_id', submissionId)
    .single()
  return (data ?? null) as unknown as ChallengeFeedback | null
}
