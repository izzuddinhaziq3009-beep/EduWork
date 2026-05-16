import { supabase } from './supabase'
import type { DigitalPortfolio, PortfolioItem } from '@/types'

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
  const { data, error } = await supabase
    .from('digital_portfolio')
    .insert({ student_id: studentId, ...payload })
    .select()
    .single()
  if (error) throw error
  return data as unknown as DigitalPortfolio
}

export async function updatePortfolio(
  portfolioId: string,
  payload: Partial<{ title: string; bio: string; skills: string[] }>,
): Promise<void> {
  const { error } = await supabase
    .from('digital_portfolio')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', portfolioId)
  if (error) throw error
}

export async function togglePublic(portfolioId: string, isPublic: boolean): Promise<void> {
  const publicUrl = isPublic ? `${portfolioId.slice(0, 8)}` : null
  const { error } = await supabase
    .from('digital_portfolio')
    .update({ is_public: isPublic, public_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', portfolioId)
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

  return {
    portfolio: portfolio as unknown as DigitalPortfolio,
    items: (items ?? []) as unknown as PortfolioItem[],
  }
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
    supabase.from('student_module_progress').select('module_id, completed').eq('student_id', studentId).eq('completed', true),
    supabase.from('project_submissions').select('id, project_id, submitted_at').eq('student_id', studentId).eq('status', 'approved'),
    supabase.from('challenge_submissions').select('id, challenge_id').eq('student_id', studentId).eq('status', 'completed'),
    supabase.from('portfolio_items').select('reference_id').eq('portfolio_id', portfolioId),
  ])

  const existingRefs = new Set(((existingItems ?? []) as { reference_id: string }[]).map(i => i.reference_id))

  const toInsert: Array<{
    portfolio_id: string; type: string; reference_id: string; title: string; description: string
  }> = []

  for (const row of (modProgress ?? []) as { module_id: string }[]) {
    if (!existingRefs.has(row.module_id)) {
      toInsert.push({ portfolio_id: portfolioId, type: 'module', reference_id: row.module_id, title: 'Completed Module', description: 'Module completed as part of my learning path.' })
    }
  }
  for (const row of (projSubs ?? []) as { id: string; project_id: string }[]) {
    if (!existingRefs.has(row.id)) {
      toInsert.push({ portfolio_id: portfolioId, type: 'project', reference_id: row.id, title: 'Project Submission', description: 'Project submitted and approved by mentor.' })
    }
  }
  for (const row of (chalSubs ?? []) as { id: string }[]) {
    if (!existingRefs.has(row.id)) {
      toInsert.push({ portfolio_id: portfolioId, type: 'challenge', reference_id: row.id, title: 'Industry Challenge', description: 'Industry challenge completed.' })
    }
  }

  if (toInsert.length > 0) {
    await supabase.from('portfolio_items').insert(toInsert)
  }
}
