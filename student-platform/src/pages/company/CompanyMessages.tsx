import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useConversationList } from '@/hooks/useMessages'
import { useCompanyEligibleStudents } from '@/hooks/useCompany'
import { ConversationList } from '@/components/features/messages/ConversationList'
import { ChatWindow } from '@/components/features/messages/ChatWindow'
import { fmtInitials } from '@/utils/formatters'
import { supabase } from '@/services/supabase'
import type { Profile } from '@/types'

const COLORS = ['#1E5BFF', '#0F4C5C', '#2C9D6E', '#C97A2D', '#B8456A']
function avatarColor(name: string) { return COLORS[name.charCodeAt(0) % COLORS.length] }

export function CompanyMessages() {
  const { user }          = useAuthStore()
  const [params]          = useSearchParams()
  const [partnerId, setPartnerId]   = useState<string>(params.get('with') ?? '')
  const [partner,   setPartner]     = useState<Profile | null>(null)
  const [showPicker, setShowPicker] = useState(false)

  const { data: conversations = [], isLoading } = useConversationList(user?.id ?? '')
  const { data: eligible = [] }                 = useCompanyEligibleStudents(user?.id ?? '')

  // Load partner profile when partnerId changes (e.g. from ?with= param)
  useEffect(() => {
    if (!partnerId) return
    const existing = conversations.find(c => c.partnerId === partnerId)
    if (existing) { setPartner(existing.partner); return }
    supabase
      .from('profiles')
      .select('*')
      .eq('id', partnerId)
      .single()
      .then(({ data }) => setPartner((data ?? null) as unknown as Profile | null))
  }, [partnerId, conversations])

  // Auto-select first conversation
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
    setShowPicker(false)
  }

  const handleStartNew = (student: Profile) => {
    setPartnerId(student.id)
    setPartner(student)
    setShowPicker(false)
  }

  // Students not yet in any conversation
  const inConversation = new Set(conversations.map(c => c.partnerId))
  const newStudents    = eligible.filter(s => !inConversation.has(s.id))

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left: conversation list */}
      <aside className="w-[300px] shrink-0 hairline-r bg-surface flex flex-col">
        <div className="px-5 py-4 hairline-b flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Messages</h2>
          {eligible.length > 0 && (
            <button
              onClick={() => setShowPicker(v => !v)}
              className="h-7 w-7 rounded-lg grid place-items-center hairline hover:bg-[var(--hair-2)] transition-colors"
              title="New conversation"
              style={{ color: 'var(--primary)' }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          )}
        </div>

        {/* Student picker */}
        {showPicker && (
          <div className="hairline-b px-3 py-3 space-y-1 bg-[var(--hair-2)]">
            <div className="text-[11px] font-mono tracking-wide muted uppercase px-2 mb-2">Students who submitted</div>
            {eligible.length === 0 ? (
              <p className="text-[12.5px] muted px-2">No students yet. They appear once they submit to your challenges.</p>
            ) : (
              eligible.map(student => (
                <button key={student.id} onClick={() => handleStartNew(student)}
                  className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-[var(--hair-2)] transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg grid place-items-center font-mono font-semibold text-white text-[11px] shrink-0"
                    style={{ background: avatarColor(student.full_name) }}>
                    {fmtInitials(student.full_name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium truncate">{student.full_name}</div>
                    {newStudents.includes(student) && (
                      <div className="text-[11px] muted">No messages yet</div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        )}

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
              Choose a student from the left, or click <strong>+</strong> to start a new conversation with a student who submitted to your challenge.
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
