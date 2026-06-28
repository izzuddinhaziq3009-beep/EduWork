import { supabase } from './supabase'
import { logActivity } from '@/utils/activityLog'
import type { IndustryChallenge, ChallengeSubmission, ChallengeFeedback, Profile } from '@/types'

type CsInsert = { challenge_id: string; student_id: string; github_url: string; github_username: string; github_repo_name: string; github_verified: boolean; github_commit_count: number; readme_exists: boolean; privacy_file_exists: boolean; status: string }
type CsBuilder = { insert(d: CsInsert): { select(): { single(): Promise<{ data: unknown; error: Error | null }> } } }
function csTable() { return supabase.from('challenge_submissions') as unknown as CsBuilder }

export interface ChallengeWithCompany extends IndustryChallenge {
  company: Profile
}

export type GitHubStepStatus = 'pending' | 'checking' | 'success' | 'error'

export interface GitHubStep {
  status:  GitHubStepStatus
  message: string
}

export interface GitHubValidationResult {
  isValid:           boolean
  username?:         string
  repoName?:         string
  commitCount?:      number
  readmeExists?:     boolean
  privacyFileExists?: boolean
  steps: {
    urlFormat:  GitHubStep
    repoPublic: GitHubStep
    readme:     GitHubStep
    privacy:    GitHubStep
    commits:    GitHubStep
  }
}

const GITHUB_BASE = import.meta.env.VITE_GITHUB_API_BASE as string

// ── Student: browse challenges ─────────────────────────────────────────────

export async function getActiveChallenges(): Promise<ChallengeWithCompany[]> {
  const { data, error } = await supabase
    .from('industry_challenges')
    .select('*')
    .eq('is_approved', true)
    .eq('is_active', true)
    .gte('deadline', new Date().toISOString())
    .order('created_at', { ascending: false })
  if (error) throw error

  const challenges = (data ?? []) as unknown as IndustryChallenge[]
  if (challenges.length === 0) return []

  const companyIds = [...new Set(challenges.map(c => c.company_id))]
  const { data: companies } = await supabase.from('profiles').select('*').in('id', companyIds)
  const cMap = Object.fromEntries(((companies ?? []) as unknown as Profile[]).map(p => [p.id, p]))

  return challenges.map(c => ({ ...c, company: cMap[c.company_id] ?? { id: c.company_id, full_name: 'Unknown', role: 'company' as const, email: '', avatar_url: null, created_at: '' } }))
}

export async function getChallengeWithCompany(id: string): Promise<ChallengeWithCompany | null> {
  const { data } = await supabase
    .from('industry_challenges')
    .select('*')
    .eq('id', id)
    .single()
  if (!data) return null

  const challenge = data as unknown as IndustryChallenge
  const { data: company } = await supabase.from('profiles').select('*').eq('id', challenge.company_id).single()

  return {
    ...challenge,
    company: (company ?? { id: challenge.company_id, full_name: 'Unknown', role: 'company' as const, email: '', avatar_url: null, created_at: '' }) as unknown as Profile,
  }
}

export interface ChallengeFeedbackWithCompany extends ChallengeFeedback {
  company: Profile
}

export interface StudentSubmissionItem {
  submission: ChallengeSubmission
  challenge:  IndustryChallenge
  company:    Profile
}

export async function getChallengeFeedbackWithCompany(submissionId: string): Promise<ChallengeFeedbackWithCompany | null> {
  const { data } = await supabase
    .from('challenge_feedback')
    .select('*')
    .eq('submission_id', submissionId)
    .single()
  if (!data) return null
  const feedback = data as unknown as ChallengeFeedback
  const { data: company } = await supabase.from('profiles').select('*').eq('id', feedback.reviewer_id).single()
  const fallback = { id: feedback.reviewer_id, full_name: 'Company', role: 'company' as const, email: '', avatar_url: null, created_at: '' }
  return { ...feedback, company: (company ?? fallback) as unknown as Profile }
}

export async function getStudentSubmissionsWithContext(studentId: string): Promise<StudentSubmissionItem[]> {
  const { data, error } = await supabase
    .from('challenge_submissions')
    .select('*')
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false })
  if (error) throw error
  const submissions = (data ?? []) as unknown as ChallengeSubmission[]
  if (submissions.length === 0) return []

  const challengeIds = [...new Set(submissions.map(s => s.challenge_id))]
  const { data: challenges } = await supabase.from('industry_challenges').select('*').in('id', challengeIds)
  const challengeMap = Object.fromEntries(((challenges ?? []) as unknown as IndustryChallenge[]).map(c => [c.id, c]))

  const companyIds = [...new Set(Object.values(challengeMap).map(c => c.company_id))]
  const { data: companies } = await supabase.from('profiles').select('*').in('id', companyIds)
  const companyMap = Object.fromEntries(((companies ?? []) as unknown as Profile[]).map(p => [p.id, p]))

  return submissions
    .filter(s => challengeMap[s.challenge_id])
    .map(s => {
      const challenge = challengeMap[s.challenge_id]
      const company   = companyMap[challenge.company_id] ?? { id: challenge.company_id, full_name: 'Unknown', role: 'company' as const, email: '', avatar_url: null, created_at: '' }
      return { submission: s, challenge, company: company as Profile }
    })
}

export async function getStudentChallengeSubmissions(studentId: string): Promise<ChallengeSubmission[]> {
  const { data, error } = await supabase
    .from('challenge_submissions')
    .select('*')
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as ChallengeSubmission[]
}

export async function getChallengeSubmission(challengeId: string, studentId: string): Promise<ChallengeSubmission | null> {
  const { data } = await supabase
    .from('challenge_submissions')
    .select('*')
    .eq('challenge_id', challengeId)
    .eq('student_id', studentId)
    .single()
  return (data ?? null) as unknown as ChallengeSubmission | null
}

export async function submitChallenge(
  challengeId: string,
  studentId: string,
  validation: GitHubValidationResult,
): Promise<ChallengeSubmission> {
  const { data, error } = await csTable()
    .insert({
      challenge_id:        challengeId,
      student_id:          studentId,
      github_url:          `https://github.com/${validation.username}/${validation.repoName}`,
      github_username:     validation.username ?? '',
      github_repo_name:    validation.repoName ?? '',
      github_verified:     true,
      github_commit_count: validation.commitCount ?? 0,
      readme_exists:       validation.readmeExists ?? false,
      privacy_file_exists: validation.privacyFileExists ?? false,
      status:              'submitted',
    })
    .select()
    .single()
  if (error) throw error
  const { data: challenge } = await supabase.from('industry_challenges').select('title').eq('id', challengeId).single()
  const title = (challenge as { title: string } | null)?.title ?? 'a challenge'
  await logActivity(studentId, 'challenge_submitted', `Submitted ${title}`)
  return data as unknown as ChallengeSubmission
}

// ── GitHub validation ──────────────────────────────────────────────────────

const PENDING_STEP: GitHubStep = { status: 'pending', message: '' }

export async function validateGitHubUrl(url: string): Promise<GitHubValidationResult> {
  const result: GitHubValidationResult = {
    isValid: false,
    steps: {
      urlFormat:  { ...PENDING_STEP },
      repoPublic: { ...PENDING_STEP },
      readme:     { ...PENDING_STEP },
      privacy:    { ...PENDING_STEP },
      commits:    { ...PENDING_STEP },
    },
  }

  // Step 1: URL format
  const match = url.trim().match(/^https?:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)\/?$/)
  if (!match) {
    result.steps.urlFormat = { status: 'error', message: 'Invalid GitHub URL format' }
    return result
  }
  const [, username, repoName] = match
  result.username = username
  result.repoName = repoName
  result.steps.urlFormat = { status: 'success', message: 'Valid GitHub URL format' }

  // Step 2: Repo exists + public
  try {
    const res = await fetch(`${GITHUB_BASE}/repos/${username}/${repoName}`)
    if (res.status === 404) {
      result.steps.repoPublic = { status: 'error', message: 'Repository not found' }
      return result
    }
    if (!res.ok) {
      result.steps.repoPublic = { status: 'error', message: 'Could not reach GitHub API' }
      return result
    }
    const repo = await res.json() as { private?: boolean }
    if (repo.private) {
      result.steps.repoPublic = { status: 'error', message: 'Repository must be public' }
      return result
    }
    result.steps.repoPublic = { status: 'success', message: 'Repository found and is public' }
  } catch {
    result.steps.repoPublic = { status: 'error', message: 'Could not reach GitHub API' }
    return result
  }

  // Step 3: README.md
  try {
    const res = await fetch(`${GITHUB_BASE}/repos/${username}/${repoName}/contents/README.md`)
    if (res.status === 404) {
      result.steps.readme = { status: 'error', message: 'README.md not found in repository root' }
      return result
    }
    result.steps.readme = { status: 'success', message: 'README.md exists' }
    result.readmeExists = true
  } catch {
    result.steps.readme = { status: 'error', message: 'Could not verify README.md' }
    return result
  }

  // Step 4: .github/SUBMISSION_PRIVACY.md
  try {
    const res = await fetch(`${GITHUB_BASE}/repos/${username}/${repoName}/contents/.github/SUBMISSION_PRIVACY.md`)
    if (res.status === 404) {
      result.steps.privacy = { status: 'error', message: '.github/SUBMISSION_PRIVACY.md not found' }
      return result
    }
    result.steps.privacy = { status: 'success', message: '.github/SUBMISSION_PRIVACY.md exists' }
    result.privacyFileExists = true
  } catch {
    result.steps.privacy = { status: 'error', message: 'Could not verify privacy file' }
    return result
  }

  // Step 5: Commits ≥ 3
  try {
    const res = await fetch(`${GITHUB_BASE}/repos/${username}/${repoName}/commits?per_page=100`)
    if (!res.ok) {
      result.steps.commits = { status: 'error', message: 'Could not count commits' }
      return result
    }
    const commits = await res.json() as unknown[]
    const count = Array.isArray(commits) ? commits.length : 0
    if (count < 3) {
      result.steps.commits = { status: 'error', message: `Minimum 3 commits required (found ${count})` }
      return result
    }
    const label = count === 100 ? '100+ commits found' : `${count} commits found`
    result.steps.commits = { status: 'success', message: label }
    result.commitCount = count
  } catch {
    result.steps.commits = { status: 'error', message: 'Could not count commits' }
    return result
  }

  result.isValid = true
  return result
}
