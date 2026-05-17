import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import {
  useAvailableMentors, useStudentRequests, useSendMentorshipRequest,
} from '@/hooks/useMentorship'
import { MentorCard, MentorCardSkeleton } from '@/components/features/mentorship/MentorCard'
import { MentorshipRequestForm } from '@/components/features/mentorship/MentorshipRequestForm'
import { RequestStatusList } from '@/components/features/mentorship/RequestStatusList'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import type { Profile } from '@/types'

export function MentorshipPage() {
  const { user } = useAuthStore()
  const [selected, setSelected] = useState<Profile | null>(null)

  const { data: mentors = [],  isLoading: loadingMentors } = useAvailableMentors()
  const { data: requests = [], isLoading: loadingReqs    } = useStudentRequests(user?.id ?? '')
  const send = useSendMentorshipRequest()

  const requestedIds = new Set(requests.map(r => r.mentor_id))

  const handleSend = (message: string) => {
    if (!user || !selected) return
    send.mutate(
      { studentId: user.id, mentorId: selected.id, message },
      { onSuccess: () => setSelected(null) },
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1100px]">
      <PageHeader
        label="Get guidance"
        title="Mentorship"
        description="Connect with experienced mentors who can guide your learning journey."
      />

      <Tabs defaultValue="browse">
        <TabsList className="mb-6">
          <TabsTrigger value="browse">Browse Mentors</TabsTrigger>
          <TabsTrigger value="requests">My Requests ({requests.length})</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        {/* Browse */}
        <TabsContent value="browse">
          {loadingMentors ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <MentorCardSkeleton key={i} />)}
            </div>
          ) : mentors.length === 0 ? (
            <EmptyState
              icon={<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2 21c.7-3.6 3.6-5.5 7-5.5s6.3 1.9 7 5.5"/></svg>}
              title="No mentors available"
              description="Check back soon as mentors join the platform."
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {mentors.map(m => (
                <MentorCard
                  key={m.id}
                  mentor={m}
                  hasRequest={requestedIds.has(m.id)}
                  onRequest={() => setSelected(m)}
                  requesting={send.isPending && selected?.id === m.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Requests */}
        <TabsContent value="requests">
          {loadingReqs ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-surface hairline rounded-2xl p-4">
                  <div className="flex gap-4"><div className="w-10 h-10 rounded-xl bg-[var(--hair-2)]" /><div className="flex-1 space-y-2"><div className="h-4 bg-[var(--hair-2)] rounded w-3/4" /><div className="h-3 bg-[var(--hair-2)] rounded w-1/2" /></div></div>
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <EmptyState
              title="No requests sent"
              description="Browse mentors and send a request to get started."
            />
          ) : (
            <RequestStatusList requests={requests} />
          )}
        </TabsContent>

        {/* Messages — redirect to the shared messages page */}
        <TabsContent value="messages">
          <div className="text-center py-12 space-y-4">
            <div className="w-14 h-14 rounded-2xl grid place-items-center mx-auto"
              style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a7 7 0 0 1-10.6 6l-4.4 1 1.1-4A7 7 0 1 1 21 12z"/>
              </svg>
            </div>
            <p className="text-[14px] muted">Message your mentor directly from the messages panel.</p>
            <a href="/messages"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--primary)' }}>
              Open messages
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
          </div>
        </TabsContent>
      </Tabs>

      {/* Request dialog */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request mentorship</DialogTitle>
            <DialogDescription>Send a request to {selected?.full_name}</DialogDescription>
          </DialogHeader>
          {selected && (
            <MentorshipRequestForm
              mentorName={selected.full_name}
              onSubmit={handleSend}
              loading={send.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
