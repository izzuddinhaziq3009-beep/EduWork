import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useConversationList } from '@/hooks/useMessages'
import { ConversationList } from '@/components/features/messages/ConversationList'
import { ChatWindow } from '@/components/features/messages/ChatWindow'
import { supabase } from '@/services/supabase'
import type { Profile } from '@/types'

export function MessagesPage() {
  const { user }          = useAuthStore()
  const [params]          = useSearchParams()
  const [partnerId, setPartnerId] = useState<string>(params.get('with') ?? '')
  const [partner, setPartner]     = useState<Profile | null>(null)

  const { data: conversations = [], isLoading } = useConversationList(user?.id ?? '')

  // If a partnerId is set (e.g. from ?with= query param or conversation click), load their profile
  useEffect(() => {
    if (!partnerId) return
    supabase
      .from('profiles')
      .select('*')
      .eq('id', partnerId)
      .single()
      .then(({ data }) => setPartner((data ?? null) as unknown as Profile | null))
  }, [partnerId])

  // When conversations load and no active partner, auto-select the first
  useEffect(() => {
    if (!partnerId && conversations.length > 0) {
      setPartnerId(conversations[0].partnerId)
      setPartner(conversations[0].partner)
    }
  }, [conversations, partnerId])

  const handleSelect = (id: string) => {
    const conv = conversations.find(c => c.partnerId === id)
    setPartnerId(id)
    if (conv) setPartner(conv.partner)
  }

  return (
    <div className="flex h-[calc(100vh-64px)]"> {/* 64px = navbar height */}
      {/* Left: conversation list */}
      <aside className="w-[300px] shrink-0 hairline-r bg-surface flex flex-col">
        <div className="px-5 py-4 hairline-b">
          <h2 className="text-[15px] font-semibold">Messages</h2>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col">
          <ConversationList
            conversations={conversations}
            activePartnerId={partnerId}
            onSelect={handleSelect}
            loading={isLoading}
          />
        </div>
      </aside>

      {/* Right: chat window */}
      <main className="flex-1 min-w-0 flex flex-col">
        {partner && user ? (
          <ChatWindow currentUserId={user.id} partner={partner} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8"
            style={{ background: 'var(--hair-2)' }}>
            <div className="w-14 h-14 rounded-2xl grid place-items-center"
              style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a7 7 0 0 1-10.6 6l-4.4 1 1.1-4A7 7 0 1 1 21 12z"/>
              </svg>
            </div>
            <div className="text-[15px] font-semibold">Select a conversation</div>
            <div className="text-[13px] muted max-w-xs">
              Choose a conversation from the left panel, or go to Mentorship to start a new one.
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
