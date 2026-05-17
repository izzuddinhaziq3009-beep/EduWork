import { Skeleton } from '@/components/ui/skeleton'
import { fmtRelative, fmtInitials } from '@/utils/formatters'
import type { ConversationPreview } from '@/services/messageService'

const COLORS = ['#0F4C5C', '#2C9D6E', '#C97A2D', '#B8456A', '#3B6AC9']
function avatarColor(name: string) { return COLORS[name.charCodeAt(0) % COLORS.length] }

interface Props {
  conversations: ConversationPreview[]
  activePartnerId?: string
  onSelect: (partnerId: string) => void
  loading?: boolean
}

export function ConversationList({ conversations, activePartnerId, onSelect, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-1 p-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 text-center">
        <div className="w-12 h-12 rounded-2xl grid place-items-center"
          style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a7 7 0 0 1-10.6 6l-4.4 1 1.1-4A7 7 0 1 1 21 12z"/>
          </svg>
        </div>
        <div className="text-[13px] font-semibold">No conversations</div>
        <div className="text-[12px] muted">Messages with mentors and students appear here.</div>
      </div>
    )
  }

  return (
    <div className="space-y-0.5 p-2 overflow-y-auto scroll-thin">
      {conversations.map(conv => {
        const isActive = conv.partnerId === activePartnerId
        return (
          <button key={conv.partnerId} onClick={() => onSelect(conv.partnerId)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${isActive ? 'bg-[var(--primary-soft)]' : 'hover:bg-[var(--hair-2)]'}`}>
            <div className="w-10 h-10 rounded-xl grid place-items-center font-mono font-semibold text-white text-[13px] shrink-0"
              style={{ background: avatarColor(conv.partner.full_name) }}>
              {fmtInitials(conv.partner.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-1">
                <span className={`text-[13.5px] truncate ${conv.unreadCount > 0 ? 'font-semibold ink' : 'font-medium ink-2'}`}>
                  {conv.partner.full_name}
                </span>
                <span className="text-[11px] font-mono muted shrink-0">
                  {fmtRelative(conv.lastMessage.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[12.5px] truncate ${conv.unreadCount > 0 ? 'ink-2 font-medium' : 'muted'}`}>
                  {conv.lastMessage.content}
                </span>
                {conv.unreadCount > 0 && (
                  <span className="shrink-0 w-5 h-5 rounded-full text-[10px] font-bold text-white grid place-items-center"
                    style={{ background: 'var(--primary)' }}>
                    {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
