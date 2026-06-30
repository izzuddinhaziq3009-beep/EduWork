import { supabase } from './supabase'
import type { DigitalPortfolio, PortfolioItem } from '@/types'

// Narrow builders bypass Supabase's `never` insert/update inference
type DpInsert = { student_id: string; title: string; bio: string; skills: string[] }
type DpUpdate = Partial<{ title: string; bio: string; skills: string[]; updated_at: string; is_public: boolean; public_url: string | null }>
type EqOne = { eq(c: string, v: string): Promise<{ error: Error | null }> }
type DpBuilder = {
  insert(d: DpInsert): { select(): { single(): Promise<{ data: unknown; error: Error | null }> } }
  update(d: DpUpdate): EqOne
}
function dpTable() { return supabase.from('digital_portfolio') as unknown as DpBuilder }

type PiInsert = { portfolio_id: string; type: string; reference_id: string; title: string; description: string }
type PiBuilder = { insert(d: PiInsert[]): Promise<{ error: Error | null }> }
function piTable() { return supabase.from('portfolio_items') as unknown as PiBuilder }

export interface PortfolioWithItems {
  portfolio: DigitalPortfolio
  items: PortfolioItem[]
}

export async function getStudentPortfolio(studentId: string): Promise<PortfolioWithItems | null> {
  const { data: portfolio } = await supabase
    .from('digital_portfolio')
    .select('*')
    .eq('student_id', studentId)
    .single()
  if (!portfolio) return null

  const { data: items } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('portfolio_id', (portfolio as unknown as DigitalPortfolio).id)
    .order('created_at', { ascending: false })

  return {
    portfolio: portfolio as unknown as DigitalPortfolio,
    items: (items ?? []) as unknown as PortfolioItem[],
  }
}

export async function createPortfolio(
  studentId: string,
  payload: { title: string; bio: string; skills: string[] },
): Promise<DigitalPortfolio> {
  const { data, error } = await dpTable()
    .insert({ student_id: studentId, ...payload })
    .select().single()
  if (error) throw error
  return data as unknown as DigitalPortfolio
}

export async function updatePortfolio(
  portfolioId: string,
  payload: Partial<{ title: string; bio: string; skills: string[] }>,
): Promise<void> {
  const { error } = await dpTable().update({ ...payload, updated_at: new Date().toISOString() }).eq('id', portfolioId)
  if (error) throw error
}

export async function togglePublic(portfolioId: string, isPublic: boolean): Promise<void> {
  const publicUrl = isPublic ? `${portfolioId.slice(0, 8)}` : null
  const { error } = await dpTable().update({ is_public: isPublic, public_url: publicUrl, updated_at: new Date().toISOString() }).eq('id', portfolioId)
  if (error) throw error
}

export async function getPublicPortfolio(publicUrl: string): Promise<PortfolioWithItems | null> {
  const { data: portfolio } = await supabase
    .from('digital_portfolio')
    .select('*')
    .eq('public_url', publicUrl)
    .eq('is_public', true)
    .single()
  if (!portfolio) return null

  const { data: items } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('portfolio_id', (portfolio as unknown as DigitalPortfolio).id)
    .order('created_at', { ascending: false })

  const rawItems = (items ?? []) as unknown as PortfolioItem[]
  const enriched = await enrichPortfolioItems(rawItems)

  return {
    portfolio: portfolio as unknown as DigitalPortfolio,
    items: enriched,
  }
}

/**
 * Replaces generic placeholder titles/descriptions stored in portfolio_items
 * with the real names fetched from the source tables.  The public portfolio
 * page is unauthenticated, so this relies on the anon-accessible SELECT
 * policies added in supabase-setup.sql for learning_modules, projects, and
 * industry_challenges.
 *
 * For items created before this fix, reference_id for project/challenge types
 * may be a submission ID rather than an entity ID — those fall back to the
 * stored title gracefully.
 */
async function enrichPortfolioItems(items: PortfolioItem[]): Promise<PortfolioItem[]> {
  const byType = (type: PortfolioItem['type']) =>
    items.filter(i => i.type === type).map(i => i.reference_id)

  const moduleIds    = byType('module')
  const projectIds   = byType('project')
  const challengeIds = byType('challenge')

  const [modulesRes, projectsRes, challengesRes] = await Promise.all([
    moduleIds.length > 0
      ? supabase.from('learning_modules').select('id, title, description').in('id', moduleIds)
      : Promise.resolve({ data: [] as { id: string; title: string; description: string }[] }),
    projectIds.length > 0
      ? supabase.from('projects').select('id, title, description').in('id', projectIds)
      : Promise.resolve({ data: [] as { id: string; title: string; description: string }[] }),
    challengeIds.length > 0
      ? supabase.from('industry_challenges').select('id, title, description').in('id', challengeIds)
      : Promise.resolve({ data: [] as { id: string; title: string; description: string }[] }),
  ])

  const toMap = (rows: { id: string; title: string; description: string }[] | null) =>
    Object.fromEntries((rows ?? []).map(r => [r.id, r]))

  const moduleMap    = toMap(modulesRes.data)
  const projectMap   = toMap(projectsRes.data)
  const challengeMap = toMap(challengesRes.data)

  return items.map(item => {
    const source =
      item.type === 'module'    ? moduleMap[item.reference_id]    :
      item.type === 'project'   ? projectMap[item.reference_id]   :
      item.type === 'challenge' ? challengeMap[item.reference_id] :
      null
    if (!source) return item
    return { ...item, title: source.title, description: source.description }
  })
}

export async function autoGeneratePortfolioItems(
  studentId: string,
  portfolioId: string,
): Promise<void> {
  const [
    { data: modProgress },
    { data: projSubs },
    { data: chalSubs },
    { data: existingItems },
  ] = await Promise.all([
    supabase.from('student_module_progress').select('module_id').eq('student_id', studentId).eq('completed', true),
    // Select project_id (not submission id) so the reference_id stored in
    // portfolio_items is a direct pointer to projects.id — this lets
    // getPublicPortfolio enrich titles with a single query, no 2-hop needed.
    supabase.from('project_submissions').select('project_id').eq('student_id', studentId).eq('status', 'approved'),
    // Same for challenges: store challenge_id, not submission id.
    supabase.from('challenge_submissions').select('challenge_id').eq('student_id', studentId),
    supabase.from('portfolio_items').select('reference_id').eq('portfolio_id', portfolioId),
  ])

  const existingRefs = new Set(((existingItems ?? []) as { reference_id: string }[]).map(i => i.reference_id))

  // Deduplicate (a student may have multiple submissions per project)
  const newModuleIds    = [...new Set((modProgress  ?? []).map((r: { module_id: string })    => r.module_id))].filter(id => !existingRefs.has(id))
  const newProjectIds   = [...new Set((projSubs     ?? []).map((r: { project_id: string })   => r.project_id))].filter(id => !existingRefs.has(id))
  const newChallengeIds = [...new Set((chalSubs     ?? []).map((r: { challenge_id: string }) => r.challenge_id))].filter(id => !existingRefs.has(id))

  if (!newModuleIds.length && !newProjectIds.length && !newChallengeIds.length) return

  // Fetch real titles and descriptions from source tables
  const [{ data: modules }, { data: projects }, { data: challenges }] = await Promise.all([
    newModuleIds.length    ? supabase.from('learning_modules').select('id, title, description').in('id', newModuleIds)      : Promise.resolve({ data: [] }),
    newProjectIds.length   ? supabase.from('projects').select('id, title, description').in('id', newProjectIds)              : Promise.resolve({ data: [] }),
    newChallengeIds.length ? supabase.from('industry_challenges').select('id, title, description').in('id', newChallengeIds) : Promise.resolve({ data: [] }),
  ])

  type Row = { id: string; title: string; description: string }
  const moduleMap    = Object.fromEntries(((modules    ?? []) as Row[]).map(r => [r.id, r]))
  const projectMap   = Object.fromEntries(((projects   ?? []) as Row[]).map(r => [r.id, r]))
  const challengeMap = Object.fromEntries(((challenges ?? []) as Row[]).map(r => [r.id, r]))

  const toInsert: Array<{ portfolio_id: string; type: string; reference_id: string; title: string; description: string }> = [
    ...newModuleIds.map(id => ({
      portfolio_id: portfolioId, type: 'module', reference_id: id,
      title:       moduleMap[id]?.title       ?? 'Completed Module',
      description: moduleMap[id]?.description ?? 'Module completed as part of my learning path.',
    })),
    ...newProjectIds.map(id => ({
      portfolio_id: portfolioId, type: 'project', reference_id: id,
      title:       projectMap[id]?.title       ?? 'Project Submission',
      description: projectMap[id]?.description ?? 'Project submitted and approved by mentor.',
    })),
    ...newChallengeIds.map(id => ({
      portfolio_id: portfolioId, type: 'challenge', reference_id: id,
      title:       challengeMap[id]?.title       ?? 'Industry Challenge',
      description: challengeMap[id]?.description ?? 'Industry challenge completed.',
    })),
  ]

  if (toInsert.length > 0) {
    await piTable().insert(toInsert)
  }
}
