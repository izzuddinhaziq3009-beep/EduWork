import { supabase } from './supabase'
import type { Profile, LearningModule, Project, IndustryChallenge, ActivityLog, UserRole, DifficultyLevel } from '@/types'

// ── Types ──────────────────────────────────────────────────────────────────

export interface SystemStats {
  students:              number
  mentors:               number
  companies:             number
  totalUsers:            number
  activeModules:         number
  activeProjects:        number
  activeChallenges:      number
  pendingChallenges:     number
  totalSubmissions:      number
  moduleCompletionRate:  number
  projectApprovalRate:   number
  challengeCompletionRate: number
}

export interface AdminUserStats {
  modulesCompleted:   number
  projectsSubmitted:  number
  challengesSubmitted: number
  studentsAssigned:   number
  feedbackGiven:      number
  challengesPosted:   number
  submissionsReceived: number
}

export interface ChallengeWithCompanyProfile extends IndustryChallenge {
  company: Profile
}

export interface PaginatedActivityLogs {
  data:  ActivityLog[]
  total: number
  page:  number
}

// ── Narrow builders — bypass Supabase `never` insert/update inference ──────

type ProfileUpdate = { full_name?: string; email?: string; is_active?: boolean }
type LmInsert = { created_by: string; title: string; description: string; difficulty_level: DifficultyLevel; duration_hours: number; content: Record<string, unknown> }
type LmUpdate = Partial<{ title: string; description: string; difficulty_level: DifficultyLevel; duration_hours: number; is_active: boolean }>
type ProjInsert = { created_by: string; title: string; description: string; requirements: string; due_date: string; module_id: string | null }
type ProjUpdate = Partial<{ title: string; description: string; requirements: string; due_date: string; module_id: string | null; is_active: boolean }>
type IcUpdate = { is_approved?: boolean; is_active?: boolean; rejection_reason?: string | null; rejected_at?: string | null }
type NotifInsert = { user_id: string; title: string; message: string; type: string }

type EqOne = { eq(c: string, v: string): Promise<{ error: Error | null }> }
type SelectSingle = { select(): { single(): Promise<{ data: unknown; error: Error | null }> } }

type ProfileBuilder = { update(d: ProfileUpdate): EqOne }
type LmBuilder      = { insert(d: LmInsert): SelectSingle; update(d: LmUpdate): EqOne }
type ProjBuilder    = { insert(d: ProjInsert): SelectSingle; update(d: ProjUpdate): EqOne }
type IcBuilder      = { update(d: IcUpdate): EqOne }
type NotifBuilder   = { insert(d: NotifInsert): Promise<{ error: Error | null }> }

function profileTable() { return supabase.from('profiles')            as unknown as ProfileBuilder }
function lmTable()      { return supabase.from('learning_modules')    as unknown as LmBuilder      }
function projTable()    { return supabase.from('projects')            as unknown as ProjBuilder    }
function icTable()      { return supabase.from('industry_challenges') as unknown as IcBuilder      }
function notifTable()   { return supabase.from('notifications')       as unknown as NotifBuilder   }

// ── System stats ────────────────────────────────────────────────────────────

export async function getSystemStats(): Promise<SystemStats> {
  const [
    { count: students }, { count: mentors }, { count: companies },
    { count: activeModules }, { count: activeProjects }, { count: activeChallenges },
    { count: pendingChallenges },
    { count: totalModProg }, { count: completedModProg },
    { count: totalProjSubs }, { count: approvedProjSubs },
    { count: totalChalSubs }, { count: completedChalSubs },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'mentor'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'company'),
    supabase.from('learning_modules').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('industry_challenges').select('*', { count: 'exact', head: true }).eq('is_approved', true).eq('is_active', true),
    supabase.from('industry_challenges').select('*', { count: 'exact', head: true }).eq('is_approved', false).is('rejection_reason', null),
    supabase.from('student_module_progress').select('*', { count: 'exact', head: true }),
    supabase.from('student_module_progress').select('*', { count: 'exact', head: true }).eq('completed', true),
    supabase.from('project_submissions').select('*', { count: 'exact', head: true }),
    supabase.from('project_submissions').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('challenge_submissions').select('*', { count: 'exact', head: true }),
    supabase.from('challenge_submissions').select('*', { count: 'exact', head: true }).in('status', ['feedback_given', 'completed']),
  ])

  return {
    students:  students  ?? 0,
    mentors:   mentors   ?? 0,
    companies: companies ?? 0,
    totalUsers: (students ?? 0) + (mentors ?? 0) + (companies ?? 0),
    activeModules:    activeModules    ?? 0,
    activeProjects:   activeProjects   ?? 0,
    activeChallenges: activeChallenges ?? 0,
    pendingChallenges: pendingChallenges ?? 0,
    totalSubmissions: (totalProjSubs ?? 0) + (totalChalSubs ?? 0),
    moduleCompletionRate:    totalModProg  ? Math.round(((completedModProg  ?? 0) / totalModProg)  * 100) : 0,
    projectApprovalRate:     totalProjSubs ? Math.round(((approvedProjSubs  ?? 0) / totalProjSubs) * 100) : 0,
    challengeCompletionRate: totalChalSubs ? Math.round(((completedChalSubs ?? 0) / totalChalSubs) * 100) : 0,
  }
}

export async function getRecentActivity(limit = 20): Promise<ActivityLog[]> {
  const { data } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data ?? []) as unknown as ActivityLog[]
}

// ── User management ────────────────────────────────────────────────────────

export async function getAllUsers(role?: UserRole): Promise<Profile[]> {
  let q = supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (role) q = q.eq('role', role)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as unknown as Profile[]
}

export async function getUserById(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) throw error
  return data as unknown as Profile
}

export async function updateUser(userId: string, payload: { full_name?: string; email?: string }): Promise<void> {
  const { error } = await profileTable().update(payload).eq('id', userId)
  if (error) throw error
}

export async function deactivateUser(userId: string): Promise<void> {
  const { error } = await profileTable().update({ is_active: false }).eq('id', userId)
  if (error) throw error
}

export async function reactivateUser(userId: string): Promise<void> {
  const { error } = await profileTable().update({ is_active: true }).eq('id', userId)
  if (error) throw error
}

export async function createUser(payload: {
  email: string; password: string; full_name: string; role: UserRole
}): Promise<Profile> {
  const { error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: { data: { full_name: payload.full_name, role: payload.role } },
  })
  if (error) throw error

  // Give the trigger time to create the profile, then fetch by email
  // (avoids JSON coercion error from parsing signUp session data)
  await new Promise(r => setTimeout(r, 800))
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', payload.email)
    .single()
  if (!profile) throw new Error('Profile was not created. Check that email confirmation is disabled in Supabase.')
  return profile as unknown as Profile
}

export async function getUserAdminStats(userId: string, role: UserRole): Promise<AdminUserStats> {
  if (role === 'student') {
    const [{ count: mod }, { count: proj }, { count: chal }] = await Promise.all([
      supabase.from('student_module_progress').select('*', { count: 'exact', head: true }).eq('student_id', userId).eq('completed', true),
      supabase.from('project_submissions').select('*', { count: 'exact', head: true }).eq('student_id', userId),
      supabase.from('challenge_submissions').select('*', { count: 'exact', head: true }).eq('student_id', userId),
    ])
    return { modulesCompleted: mod ?? 0, projectsSubmitted: proj ?? 0, challengesSubmitted: chal ?? 0, studentsAssigned: 0, feedbackGiven: 0, challengesPosted: 0, submissionsReceived: 0 }
  }
  if (role === 'mentor') {
    const [{ count: students }, { count: feedback }] = await Promise.all([
      supabase.from('mentorship_requests').select('*', { count: 'exact', head: true }).eq('mentor_id', userId).eq('status', 'accepted'),
      supabase.from('mentor_feedback').select('*', { count: 'exact', head: true }).eq('mentor_id', userId),
    ])
    return { modulesCompleted: 0, projectsSubmitted: 0, challengesSubmitted: 0, studentsAssigned: students ?? 0, feedbackGiven: feedback ?? 0, challengesPosted: 0, submissionsReceived: 0 }
  }
  if (role === 'company') {
    const { data: challenges } = await supabase.from('industry_challenges').select('id').eq('company_id', userId)
    const ids = ((challenges ?? []) as { id: string }[]).map(c => c.id)
    const { count: subs } = ids.length > 0
      ? await supabase.from('challenge_submissions').select('*', { count: 'exact', head: true }).in('challenge_id', ids)
      : { count: 0 }
    return { modulesCompleted: 0, projectsSubmitted: 0, challengesSubmitted: 0, studentsAssigned: 0, feedbackGiven: 0, challengesPosted: ids.length, submissionsReceived: subs ?? 0 }
  }
  return { modulesCompleted: 0, projectsSubmitted: 0, challengesSubmitted: 0, studentsAssigned: 0, feedbackGiven: 0, challengesPosted: 0, submissionsReceived: 0 }
}

// ── Modules CRUD ────────────────────────────────────────────────────────────

export async function getAllModulesAdmin(): Promise<LearningModule[]> {
  const { data, error } = await supabase.from('learning_modules').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as LearningModule[]
}

export async function createModule(adminId: string, payload: {
  title: string; description: string; difficulty_level: DifficultyLevel; duration_hours: number; content?: Record<string, unknown>
}): Promise<LearningModule> {
  const { data, error } = await lmTable()
    .insert({ created_by: adminId, ...payload, content: payload.content ?? {} })
    .select().single()
  if (error) throw error
  return data as unknown as LearningModule
}

export async function updateModule(id: string, payload: LmUpdate): Promise<void> {
  const { error } = await lmTable().update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteModule(id: string): Promise<void> {
  const { error } = await supabase.from('learning_modules').delete().eq('id', id)
  if (error) throw error
}

export async function toggleModuleActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await lmTable().update({ is_active: isActive }).eq('id', id)
  if (error) throw error
}

// ── Projects CRUD ───────────────────────────────────────────────────────────

export async function getAllProjectsAdmin(): Promise<Project[]> {
  const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as Project[]
}

export async function createProject(adminId: string, payload: {
  title: string; description: string; requirements: string; due_date: string; module_id?: string
}): Promise<Project> {
  const { data, error } = await projTable()
    .insert({ created_by: adminId, ...payload, module_id: payload.module_id || null })
    .select().single()
  if (error) throw error
  return data as unknown as Project
}

export async function updateProject(id: string, payload: ProjUpdate): Promise<void> {
  const { error } = await projTable().update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

export async function toggleProjectActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await projTable().update({ is_active: isActive }).eq('id', id)
  if (error) throw error
}

// ── Independent projects (admin view only) ─────────────────────────────────

export async function getAllIndependentProjectsAdmin() {
  const { data, error } = await supabase
    .from('independent_projects')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as Array<{ id: string; title: string; description: string; status: string; student_id: string; created_at: string; profiles: { full_name: string; email: string } }>
}

export async function deleteIndependentProject(id: string): Promise<void> {
  const { error } = await supabase.from('independent_projects').delete().eq('id', id)
  if (error) throw error
}

// ── Challenge moderation ────────────────────────────────────────────────────

async function enrichChallengesWithCompany(challenges: IndustryChallenge[]): Promise<ChallengeWithCompanyProfile[]> {
  if (challenges.length === 0) return []
  const ids = [...new Set(challenges.map(c => c.company_id))]
  const { data: companies } = await supabase.from('profiles').select('*').in('id', ids)
  const map = Object.fromEntries(((companies ?? []) as unknown as Profile[]).map(p => [p.id, p]))
  return challenges.map(c => ({ ...c, company: map[c.company_id] ?? { id: c.company_id, full_name: 'Unknown', role: 'company' as const, email: '', avatar_url: null, created_at: '' } }))
}

export async function getPendingChallenges(): Promise<ChallengeWithCompanyProfile[]> {
  const { data, error } = await supabase
    .from('industry_challenges')
    .select('*')
    .eq('is_approved', false)
    .is('rejection_reason', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return enrichChallengesWithCompany((data ?? []) as unknown as IndustryChallenge[])
}

export async function getApprovedChallenges(): Promise<ChallengeWithCompanyProfile[]> {
  const { data, error } = await supabase
    .from('industry_challenges')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return enrichChallengesWithCompany((data ?? []) as unknown as IndustryChallenge[])
}

export async function getRejectedChallenges(): Promise<ChallengeWithCompanyProfile[]> {
  const { data, error } = await supabase
    .from('industry_challenges')
    .select('*')
    .not('rejection_reason', 'is', null)
    .order('rejected_at', { ascending: false })
  if (error) throw error
  return enrichChallengesWithCompany((data ?? []) as unknown as IndustryChallenge[])
}

export async function getAllChallengesAdmin(): Promise<ChallengeWithCompanyProfile[]> {
  const { data, error } = await supabase
    .from('industry_challenges')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return enrichChallengesWithCompany((data ?? []) as unknown as IndustryChallenge[])
}

export async function approveChallenge(challengeId: string, companyId: string, challengeTitle: string): Promise<void> {
  await icTable().update({ is_approved: true, is_active: true }).eq('id', challengeId)
  await notifTable().insert({
    user_id: companyId,
    title:   'Your challenge has been approved!',
    message: `"${challengeTitle}" is now live and students can submit their solutions.`,
    type:    'challenge',
  })
}

export async function rejectChallenge(challengeId: string, companyId: string, challengeTitle: string, reason: string): Promise<void> {
  await icTable().update({
    is_approved:      false,
    is_active:        false,
    rejection_reason: reason,
    rejected_at:      new Date().toISOString(),
  }).eq('id', challengeId)
  await notifTable().insert({
    user_id: companyId,
    title:   'Challenge not approved',
    message: `Your challenge "${challengeTitle}" was not approved. Reason: ${reason}`,
    type:    'challenge',
  })
}

// ── Activity logs ───────────────────────────────────────────────────────────

export async function getActivityLogs(page = 0, perPage = 20, search = ''): Promise<PaginatedActivityLogs> {
  let q = supabase
    .from('activity_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * perPage, (page + 1) * perPage - 1)

  if (search) q = q.ilike('description', `%${search}%`)

  const { data, count, error } = await q
  if (error) throw error
  return { data: (data ?? []) as unknown as ActivityLog[], total: count ?? 0, page }
}

export async function getUserActivityLogs(userId: string): Promise<ActivityLog[]> {
  const { data } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  return (data ?? []) as unknown as ActivityLog[]
}

export async function getLearningActivityLogs(): Promise<ActivityLog[]> {
  const { data } = await supabase
    .from('activity_logs')
    .select('*')
    .in('action', ['module_enrolled', 'module_completed'])
    .order('created_at', { ascending: false })
    .limit(100)
  return (data ?? []) as unknown as ActivityLog[]
}

export async function getProjectActivityLogs(): Promise<ActivityLog[]> {
  const { data } = await supabase
    .from('activity_logs')
    .select('*')
    .in('action', ['project_submitted', 'feedback_given'])
    .order('created_at', { ascending: false })
    .limit(100)
  return (data ?? []) as unknown as ActivityLog[]
}

export async function getChallengeActivityLogs(): Promise<ActivityLog[]> {
  const { data } = await supabase
    .from('activity_logs')
    .select('*')
    .in('action', ['challenge_submitted', 'challenge_approved', 'challenge_feedback'])
    .order('created_at', { ascending: false })
    .limit(100)
  return (data ?? []) as unknown as ActivityLog[]
}
