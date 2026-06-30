import { vi, type Mock } from 'vitest'

export type QueryResult = { data: unknown; error: Error | null }

const CHAIN_METHODS = [
  'select', 'insert', 'update', 'upsert', 'delete',
  'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'is', 'contains',
  'order', 'limit', 'range', 'match', 'filter', 'ilike', 'or',
] as const

/**
 * Builds a chainable, thenable stand-in for a Supabase query builder.
 * Every chain method returns the same builder; awaiting it (directly, or via
 * .single()/.maybeSingle()) resolves to the given result — mirroring how
 * supabase-js builders are simultaneously chainable and promise-like.
 */
export function makeQueryBuilder(result: QueryResult) {
  const builder: Record<string, unknown> = {}
  for (const method of CHAIN_METHODS) {
    builder[method] = vi.fn(() => builder)
  }
  builder.single = vi.fn(() => Promise.resolve(result))
  builder.maybeSingle = vi.fn(() => Promise.resolve(result))
  builder.then = (onFulfilled: (r: QueryResult) => unknown, onRejected?: (e: unknown) => unknown) =>
    Promise.resolve(result).then(onFulfilled, onRejected)
  builder.catch = (onRejected: (e: unknown) => unknown) => Promise.resolve(result).catch(onRejected)
  return builder
}

/** Queues up builders on a mocked `supabase.from`, one per call, in order. */
export function queueFromResults(fromMock: Mock, results: QueryResult[]) {
  for (const result of results) {
    fromMock.mockReturnValueOnce(makeQueryBuilder(result))
  }
}

export function ok(data: unknown): QueryResult {
  return { data, error: null }
}

export function fail(error: Error): QueryResult {
  return { data: null, error }
}
