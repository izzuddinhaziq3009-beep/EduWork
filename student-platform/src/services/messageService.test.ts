import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { ok, fail, queueFromResults } from '@/test/supabaseMock'

vi.mock('./supabase', () => ({ supabase: { from: vi.fn() } }))

import { supabase } from './supabase'
import { getConversation, sendMessage, getConversationList } from './messageService'

const fromMock = supabase.from as Mock

beforeEach(() => {
  fromMock.mockReset()
})

describe('getConversation', () => {
  it('returns messages between two users', async () => {
    queueFromResults(fromMock, [ok([{ id: 'm1', sender_id: 'u1', receiver_id: 'u2' }])])
    expect(await getConversation('u1', 'u2')).toEqual([{ id: 'm1', sender_id: 'u1', receiver_id: 'u2' }])
  })

  it('throws on query error', async () => {
    queueFromResults(fromMock, [fail(new Error('boom'))])
    await expect(getConversation('u1', 'u2')).rejects.toThrow('boom')
  })
})

describe('sendMessage', () => {
  it('inserts and returns the message', async () => {
    queueFromResults(fromMock, [ok({ id: 'm1', sender_id: 'u1', receiver_id: 'u2', content: 'hi' })])
    const result = await sendMessage('u1', 'u2', 'hi')
    expect(result.content).toBe('hi')
  })
})

describe('getConversationList', () => {
  it('returns an empty array when the user has no messages', async () => {
    queueFromResults(fromMock, [ok([])])
    expect(await getConversationList('u1')).toEqual([])
    expect(fromMock).toHaveBeenCalledTimes(1)
  })

  it('groups messages by partner, tracking the latest message and unread count', async () => {
    queueFromResults(fromMock, [
      ok([
        { id: 'm3', sender_id: 'u2', receiver_id: 'u1', content: 'latest', read: false, created_at: '2026-01-03' },
        { id: 'm2', sender_id: 'u1', receiver_id: 'u2', content: 'middle', read: true, created_at: '2026-01-02' },
        { id: 'm1', sender_id: 'u2', receiver_id: 'u1', content: 'first', read: false, created_at: '2026-01-01' },
      ]),
      ok([{ id: 'u2', full_name: 'Partner' }]),
    ])
    const result = await getConversationList('u1')
    expect(result).toHaveLength(1)
    expect(result[0].partnerId).toBe('u2')
    expect(result[0].lastMessage.id).toBe('m3')
    expect(result[0].unreadCount).toBe(2)
  })

  it('sorts conversations by most recent message, newest first', async () => {
    queueFromResults(fromMock, [
      ok([
        { id: 'm1', sender_id: 'u1', receiver_id: 'partnerA', content: 'old', read: true, created_at: '2026-01-01' },
        { id: 'm2', sender_id: 'u1', receiver_id: 'partnerB', content: 'new', read: true, created_at: '2026-01-05' },
      ]),
      ok([{ id: 'partnerA', full_name: 'A' }, { id: 'partnerB', full_name: 'B' }]),
    ])
    const result = await getConversationList('u1')
    expect(result.map(c => c.partnerId)).toEqual(['partnerB', 'partnerA'])
  })

  it('filters out partners whose profile could not be found', async () => {
    queueFromResults(fromMock, [
      ok([{ id: 'm1', sender_id: 'u1', receiver_id: 'ghost', content: 'hi', read: true, created_at: '2026-01-01' }]),
      ok([]),
    ])
    const result = await getConversationList('u1')
    expect(result).toEqual([])
  })
})
