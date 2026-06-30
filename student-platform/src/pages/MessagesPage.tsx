import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useConversationList } from '@/hooks/useMessages'
import { ConversationList } from '@/components/features/messages/ConversationList'
import { ChatWindow } from '@/components/features/messages/ChatWindow'
import { supabase } from '@/services/supabase'
import { useQuery } from '@tanstack/react-query'
import { getStudentSummary } from '@/services/companyService'
import { fmtInitials, fmtRelative } from '@/utils/formatters'
import type { Profile } from '@/types'

const AVATAR_COLORS = ['#0F4C5C', '#2C9D6E', '#C97A2D', '#B8456A', '#3B6AC9']
function avatarColor(name: string) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] }

export function MessagesPage() {
  const { user, role }    = useAuthStore()
  const [params]          = useSearchParams()
  const [explicitPartnerId, setExplicitPartnerId] = useState<string>(params.get('with') ?? '')
  const [fetchedPartner, setFetchedPartner]       = useState<Profile | null>(null)

  const { data: conversations = [], isLoading } = useConversationList(user?.id ?? '')

  // Falls back to the first conversation once conversations load, if the
  // user hasn't explicitly picked one (e.g. via ?with= or clicking in the list).
  const partnerId = explicitPartnerId || conversations[0]?.partnerId || ''
  const conversationPartner = conversations.find(c => c.partnerId === partnerId)?.partner ?? null
  const partner = conversationPartner ?? fetchedPartner

  // Only need to fetch when the partner isn't already part of a loaded
  // conversation (e.g. landing here via a ?with= link with no conversation yet).
  useEffect(() => {
    if (!partnerId || conversationPartner) return
    supabase
      .from('profiles')
      .select('*')
      .eq('id', partnerId)
      .single()
      .then(({ data }) => setFetchedPartner((data ?? null) as unknown as Profile | null))
  }, [partnerId, conversationPartner])

  const isMentorViewingStudent = role === 'mentor' && partner?.role === 'student'
  const lastMessageAt = conversations.find(c => c.partnerId === partnerId)?.lastMessage.created_at

  const { data: studentSummary } = useQuery({
    queryKey: ['student-summary', partner?.id],
    queryFn:  () => getStudentSummary(partner!.id),
    enabled:  isMentorViewingStudent && !!partner?.id,
  })

  const handleSelect = (id: string) => {
    setExplicitPartnerId(id)
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
          <>
            {/* Combined student header — shown to mentors only when chatting with a student.
                Passes hideHeader to ChatWindow so the built-in header is suppressed. */}
            {isMentorViewingStudent && (
              <div className="px-5 py-4 hairline-b bg-surface flex items-center gap-4 shrink-0">
                <div className="w-10 h-10 rounded-xl grid place-items-center font-mono font-bold text-white text-[14px] shrink-0"
                  style={{ background: avatarColor(partner.full_name) }}>
                  {fmtInitials(partner.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-[15px] font-semibold">{partner.full_name}</div>
                    <span className="text-[10px] font-mono capitalize px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                      {partner.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] muted">{partner.email}</span>
                    {lastMessageAt && (
                      <span className="text-[11.5px] font-mono muted">· {fmtRelative(lastMessageAt)}</span>
                    )}
                  </div>
                </div>
                {studentSummary && (
                  <div className="flex gap-5 text-center shrink-0">
                    {[
                      { label: 'Modules',    value: studentSummary.completedModules    },
                      { label: 'Projects',   value: studentSummary.approvedProjects    },
                      { label: 'Challenges', value: studentSummary.completedChallenges },
                    ].map(s => (
                      <div key={s.label}>
                        <div className="font-display text-[18px] font-semibold leading-none">{s.value}</div>
                        <div className="text-[10px] font-mono muted mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="flex-1 min-h-0">
              <ChatWindow currentUserId={user.id} partner={partner} hideHeader={isMentorViewingStudent} />
            </div>
          </>
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
