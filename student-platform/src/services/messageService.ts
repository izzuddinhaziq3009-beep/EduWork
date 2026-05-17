import { supabase } from './supabase'
import type { Message, Profile } from '@/types'

export interface ConversationPreview {
  partnerId:    string
  partner:      Profile
  lastMessage:  Message
  unreadCount:  number
}

export async function getConversation(userId1: string, userId2: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),` +
      `and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`,
    )
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as unknown as Message[]
}

export async function sendMessage(senderId: string, receiverId: string, content: string): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: senderId, receiver_id: receiverId, content })
    .select()
    .single()
  if (error) throw error
  return data as unknown as Message
}

export async function markMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
  await supabase
    .from('messages')
    .update({ read: true })
    .eq('sender_id', senderId)
    .eq('receiver_id', receiverId)
    .eq('read', false)
}

export async function getConversationList(userId: string): Promise<ConversationPreview[]> {
  const { data } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (!data?.length) return []

  const messages = (data ?? []) as unknown as Message[]

  // Build unique partner map: partner → { latest message, unread count }
  const partnerMap = new Map<string, { message: Message; unread: number }>()
  for (const msg of messages) {
    const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
    const isUnread  = msg.receiver_id === userId && !msg.read
    if (!partnerMap.has(partnerId)) {
      partnerMap.set(partnerId, { message: msg, unread: isUnread ? 1 : 0 })
    } else if (isUnread) {
      partnerMap.get(partnerId)!.unread++
    }
  }

  if (partnerMap.size === 0) return []

  const partnerIds = Array.from(partnerMap.keys())
  const { data: profiles } = await supabase.from('profiles').select('*').in('id', partnerIds)
  const profileMap = Object.fromEntries(((profiles ?? []) as unknown as Profile[]).map(p => [p.id, p]))

  return partnerIds
    .filter(id => profileMap[id])
    .map(id => ({
      partnerId:   id,
      partner:     profileMap[id],
      lastMessage: partnerMap.get(id)!.message,
      unreadCount: partnerMap.get(id)!.unread,
    }))
    .sort((a, b) =>
      new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime(),
    )
}
