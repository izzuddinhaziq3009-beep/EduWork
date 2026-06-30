import { useEffect, useRef, useState } from 'react'
import { useConversation, useSendMessage, useRealtimeMessages, useMarkRead } from '@/hooks/useMessages'
import { Skeleton } from '@/components/ui/skeleton'
import { fmtInitials, fmtDateTime, fmtRelative } from '@/utils/formatters'
import type { Profile } from '@/types'

const COLORS = ['#0F4C5C', '#2C9D6E', '#C97A2D', '#B8456A', '#3B6AC9']
function avatarColor(name: string) { return COLORS[name.charCodeAt(0) % COLORS.length] }

interface Props {
  currentUserId: string
  partner: Profile
  /** When true, suppresses the built-in header so the parent can render its own. */
  hideHeader?: boolean
}

export function ChatWindow({ currentUserId, partner, hideHeader = false }: Props) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: messages = [], isLoading } = useConversation(currentUserId, partner.id)
  const send     = useSendMessage()
  const markRead = useMarkRead()

  // Subscribe to real-time updates for this conversation
  useRealtimeMessages(currentUserId, partner.id)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Mark messages as read when conversation opens
  useEffect(() => {
    if (messages.length > 0) {
      markRead.mutate({ senderId: partner.id, receiverId: currentUserId })
    }
  }, [partner.id, currentUserId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = () => {
    const content = input.trim()
    if (!content || send.isPending) return
    setInput('')
    send.mutate({ senderId: currentUserId, receiverId: partner.id, content })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header — hidden when the parent supplies its own header card */}
      {!hideHeader && (
        <div className="px-5 py-4 hairline-b flex items-center gap-3 bg-surface">
          <div className="w-9 h-9 rounded-lg grid place-items-center font-mono font-semibold text-white text-[12px] shrink-0"
            style={{ background: avatarColor(partner.full_name) }}>
            {fmtInitials(partner.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold">{partner.full_name}</div>
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] muted font-mono capitalize">{partner.role}</span>
              {messages.length > 0 && (
                <span className="text-[11.5px] muted font-mono">
                  · {fmtRelative(messages[messages.length - 1].created_at)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scroll-thin px-5 py-4 space-y-3"
        style={{ background: 'var(--hair-2)' }}>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <Skeleton className={`h-10 rounded-2xl ${i % 2 === 0 ? 'w-52' : 'w-40'}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-16 text-center">
            <div>
              <div className="text-[13px] font-semibold ink-2">Start the conversation</div>
              <div className="text-[12px] muted mt-1">Send a message to {partner.full_name}.</div>
            </div>
          </div>
        ) : messages.map((msg, i) => {
          const isMine   = msg.sender_id === currentUserId
          const prevMsg  = messages[i - 1]
          const showTime = !prevMsg || (
            new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() > 1000 * 60 * 10
          )

          return (
            <div key={msg.id}>
              {showTime && (
                <div className="text-center text-[11px] font-mono muted py-1">
                  {fmtDateTime(msg.created_at)}
                </div>
              )}
              <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed ${isMine ? 'rounded-br-md' : 'rounded-bl-md'}`}
                  style={isMine
                    ? { background: 'var(--primary)', color: '#fff' }
                    : { background: '#fff', color: 'var(--ink)', boxShadow: '0 1px 2px rgba(0,0,0,0.06)', border: '1px solid var(--hair)' }
                  }>
                  {msg.content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 hairline-t bg-surface flex items-end gap-3">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${partner.full_name}…`}
          rows={1}
          className="flex-1 resize-none outline-none text-[14px] placeholder:text-[color:var(--muted)] bg-transparent leading-relaxed py-1 max-h-32 scroll-thin"
          style={{ lineHeight: '1.5' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || send.isPending}
          className="h-9 w-9 rounded-xl grid place-items-center disabled:opacity-40 transition-opacity shrink-0"
          style={{ background: 'var(--primary)', color: '#fff' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
