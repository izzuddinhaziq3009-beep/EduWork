import { useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getConversation, sendMessage, markMessagesAsRead, getConversationList,
} from '@/services/messageService'
import { supabase } from '@/services/supabase'
import { useToast } from './use-toast'
import type { Message } from '@/types'

export const msgKeys = {
  conversation: (u1: string, u2: string) => {
    const sorted = [u1, u2].sort()
    return ['conversation', sorted[0], sorted[1]] as const
  },
  list: (userId: string) => ['conversation-list', userId] as const,
}

export function useConversation(userId1: string, userId2: string) {
  return useQuery({
    queryKey: msgKeys.conversation(userId1, userId2),
    queryFn:  () => getConversation(userId1, userId2),
    enabled:  !!(userId1 && userId2),
    staleTime: 0,
  })
}

export function useConversationList(userId: string) {
  return useQuery({
    queryKey: msgKeys.list(userId),
    queryFn:  () => getConversationList(userId),
    enabled:  !!userId,
    staleTime: 1000 * 30,
  })
}

export function useSendMessage() {
  const qc = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: ({ senderId, receiverId, content }: { senderId: string; receiverId: string; content: string }) =>
      sendMessage(senderId, receiverId, content),
    onSuccess: (newMsg, { senderId, receiverId }) => {
      // Optimistically update cache
      const key = msgKeys.conversation(senderId, receiverId)
      qc.setQueryData(key, (old: Message[] | undefined) => [...(old ?? []), newMsg])
      qc.invalidateQueries({ queryKey: msgKeys.list(senderId) })
    },
    onError: (err: Error) => toast({ title: 'Failed to send', description: err.message, variant: 'destructive' }),
  })
}

// ── Real-time subscription for a conversation ──────────────────────────────
export function useRealtimeMessages(currentUserId: string, partnerId: string) {
  const qc = useQueryClient()

  useEffect(() => {
    if (!currentUserId || !partnerId) return

    const channel = supabase
      .channel(`messages:${[currentUserId, partnerId].sort().join(':')}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'messages',
          filter: `receiver_id=eq.${currentUserId}`,
        },
        (payload) => {
          const msg = payload.new as Message
          // Only process messages from this specific partner
          if (msg.sender_id !== partnerId) return
          const key = msgKeys.conversation(currentUserId, partnerId)
          qc.setQueryData(key, (old: Message[] | undefined) => {
            // Deduplicate by id
            const existing = old ?? []
            if (existing.some(m => m.id === msg.id)) return existing
            return [...existing, msg]
          })
          qc.invalidateQueries({ queryKey: msgKeys.list(currentUserId) })
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [currentUserId, partnerId, qc])
}

// ── Real-time subscription for notifications ───────────────────────────────
export const notifKeys = {
  unread: (userId: string) => ['notifications-unread', userId] as const,
}

export function useRealtimeNotifications(userId: string) {
  const qc = useQueryClient()

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: notifKeys.unread(userId) })
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, qc])
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ senderId, receiverId }: { senderId: string; receiverId: string }) =>
      markMessagesAsRead(senderId, receiverId),
    onSuccess: (_, { receiverId }) => {
      qc.invalidateQueries({ queryKey: msgKeys.list(receiverId) })
    },
  })
}
