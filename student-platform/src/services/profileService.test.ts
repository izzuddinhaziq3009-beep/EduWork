import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('./supabase', () => ({ supabase: { from: vi.fn(), rpc: vi.fn() } }))

import { supabase } from './supabase'
import { markOnboarded } from './profileService'

const rpcMock = supabase.rpc as Mock

beforeEach(() => { rpcMock.mockReset() })

describe('markOnboarded', () => {
  it('calls mark_profile_onboarded RPC and resolves without a value', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: null })
    await expect(markOnboarded('user1')).resolves.toBeUndefined()
    expect(rpcMock).toHaveBeenCalledWith('mark_profile_onboarded')
    expect(rpcMock).toHaveBeenCalledTimes(1)
  })

  it('throws when the RPC returns an error', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: new Error('Not authenticated') })
    await expect(markOnboarded('user1')).rejects.toThrow('Not authenticated')
  })
})
