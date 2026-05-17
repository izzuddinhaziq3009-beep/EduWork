import { useAuthStore } from '@/stores/authStore'
import { useMentorshipRequests, useAcceptedMentees, useAcceptRequest, useRejectRequest } from '@/hooks/useMentor'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fmtRelative, fmtInitials } from '@/utils/formatters'
import { useNavigate } from 'react-router-dom'

const COLORS = ['#0F4C5C', '#2C9D6E', '#C97A2D', '#B8456A', '#3B6AC9']
function avatarColor(name: string) { return COLORS[name.charCodeAt(0) % COLORS.length] }

export function MentorshipRequests() {
  const { user } = useAuthStore()
  const navigate  = useNavigate()
  const mid = user?.id ?? ''

  const { data: requests = [],  isLoading: loadingReqs  } = useMentorshipRequests(mid)
  const { data: mentees  = [],  isLoading: loadingMentees } = useAcceptedMentees(mid)
  const accept = useAcceptRequest()
  const reject = useRejectRequest()

  return (
    <div className="p-6 lg:p-8 max-w-[900px]">
      <PageHeader
        label="Your students"
        title="Mentorship Requests"
        description="Accept requests from students and manage your active mentees."
      />

      <Tabs defaultValue="pending">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            Pending{requests.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white"
                style={{ background: 'var(--rose)' }}>{requests.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="mentees">Active Mentees ({mentees.length})</TabsTrigger>
        </TabsList>

        {/* Pending requests */}
        <TabsContent value="pending">
          {loadingReqs ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
            </div>
          ) : requests.length === 0 ? (
            <EmptyState
              icon={<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M8 12V5a2 2 0 1 1 4 0v7"/><path d="M12 12V4a2 2 0 1 1 4 0v8"/><path d="M16 12V6a2 2 0 1 1 4 0v9a6 6 0 0 1-6 6H10a4 4 0 0 1-4-4v-1L3 12a2 2 0 1 1 3-3l2 3"/></svg>}
              title="No pending requests"
              description="New mentorship requests from students will appear here."
            />
          ) : (
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className="bg-surface hairline rounded-2xl shadow-card p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl grid place-items-center font-mono font-semibold text-white shrink-0"
                      style={{ background: avatarColor(req.student.full_name), fontSize: 14 }}>
                      {fmtInitials(req.student.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-[15px] font-semibold">{req.student.full_name}</span>
                        <span className="text-[11.5px] font-mono muted">{fmtRelative(req.created_at)}</span>
                      </div>
                      <p className="text-[13.5px] ink-2 mt-2 leading-relaxed">{req.message}</p>
                    </div>
                    <div className="flex gap-2 shrink-0 mt-0.5">
                      <button
                        onClick={() => reject.mutate({ requestId: req.id, studentId: req.student_id, mentorId: mid })}
                        disabled={reject.isPending || accept.isPending}
                        className="h-9 px-4 rounded-xl hairline text-[13px] font-semibold hover:bg-[var(--hair-2)] disabled:opacity-60 transition-colors"
                        style={{ color: 'var(--rose)' }}>
                        Decline
                      </button>
                      <button
                        onClick={() => accept.mutate({ requestId: req.id, studentId: req.student_id, mentorId: mid })}
                        disabled={accept.isPending || reject.isPending}
                        className="h-9 px-4 rounded-xl text-[13px] font-semibold text-white disabled:opacity-60 transition-opacity hover:opacity-90"
                        style={{ background: 'var(--accent)' }}>
                        {accept.isPending ? '…' : 'Accept'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Active mentees */}
        <TabsContent value="mentees">
          {loadingMentees ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
            </div>
          ) : mentees.length === 0 ? (
            <EmptyState
              title="No active mentees yet"
              description="Accept a pending request to start mentoring students."
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {mentees.map(({ student, request }) => (
                <div key={request.id} className="bg-surface hairline rounded-2xl shadow-card p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl grid place-items-center font-mono font-semibold text-white shrink-0"
                    style={{ background: avatarColor(student.full_name), fontSize: 15 }}>
                    {fmtInitials(student.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14.5px] font-semibold truncate">{student.full_name}</div>
                    <div className="text-[12px] muted font-mono">Student</div>
                    <div className="text-[11.5px] muted mt-0.5">Since {fmtRelative(request.created_at)}</div>
                  </div>
                  <button
                    onClick={() => navigate(`/messages?with=${student.id}`)}
                    className="h-9 w-9 rounded-xl hairline grid place-items-center hover:bg-[var(--hair-2)] transition-colors shrink-0"
                    title="Message student"
                    style={{ color: 'var(--primary)' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a7 7 0 0 1-10.6 6l-4.4 1 1.1-4A7 7 0 1 1 21 12z"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
