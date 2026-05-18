import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Layout } from '@/components/layout/Layout'
import {
  StudentRoute, MentorRoute, CompanyRoute, AdminRoute, AuthRoute,
} from '@/components/auth/ProtectedRoute'

// ── Page-level lazy imports ────────────────────────────────────────────────
// Each page is a separate chunk. An error in one page won't crash the others.
const LoginPage           = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })))
const SignupPage           = lazy(() => import('@/pages/SignupPage').then(m => ({ default: m.SignupPage })))
const ForgotPasswordPage   = lazy(() => import('@/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))

const Dashboard            = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const ModulesPage          = lazy(() => import('@/pages/ModulesPage').then(m => ({ default: m.ModulesPage })))
const ModuleDetailPage     = lazy(() => import('@/pages/ModuleDetailPage').then(m => ({ default: m.ModuleDetailPage })))
const ProjectsPage         = lazy(() => import('@/pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })))
const ProjectDetailPage    = lazy(() => import('@/pages/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })))
const ProgressPage         = lazy(() => import('@/pages/ProgressPage').then(m => ({ default: m.ProgressPage })))
const MentorshipPage       = lazy(() => import('@/pages/MentorshipPage').then(m => ({ default: m.MentorshipPage })))
const PortfolioPage        = lazy(() => import('@/pages/PortfolioPage').then(m => ({ default: m.PortfolioPage })))
const PublicPortfolioPage  = lazy(() => import('@/pages/PublicPortfolioPage').then(m => ({ default: m.PublicPortfolioPage })))
const IndependentProjectsPage = lazy(() => import('@/pages/IndependentProjectsPage').then(m => ({ default: m.IndependentProjectsPage })))
const PlaceholderPage      = lazy(() => import('@/pages/PlaceholderPage').then(m => ({ default: m.PlaceholderPage })))
const NotFoundPage         = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))

const MentorDashboard         = lazy(() => import('@/pages/mentor/MentorDashboard').then(m => ({ default: m.MentorDashboard })))
const SubmissionsPage         = lazy(() => import('@/pages/mentor/SubmissionsPage').then(m => ({ default: m.SubmissionsPage })))
const SubmissionDetail        = lazy(() => import('@/pages/mentor/SubmissionDetail').then(m => ({ default: m.SubmissionDetail })))
const MentorshipRequests      = lazy(() => import('@/pages/mentor/MentorshipRequests').then(m => ({ default: m.MentorshipRequests })))
const MessagesPage            = lazy(() => import('@/pages/MessagesPage').then(m => ({ default: m.MessagesPage })))
const CompanyDashboard        = lazy(() => import('@/pages/company/CompanyDashboard').then(m => ({ default: m.CompanyDashboard })))
const CompanyProfilePage      = lazy(() => import('@/pages/company/ProfilePage').then(m => ({ default: m.ProfilePage })))
const PostChallenge           = lazy(() => import('@/pages/company/PostChallenge').then(m => ({ default: m.PostChallenge })))
const MyChallenges            = lazy(() => import('@/pages/company/MyChallenges').then(m => ({ default: m.MyChallenges })))
const EditChallenge           = lazy(() => import('@/pages/company/EditChallenge').then(m => ({ default: m.EditChallenge })))
const CompanySubmissions      = lazy(() => import('@/pages/company/Submissions').then(m => ({ default: m.CompanySubmissions })))
const CompanySubmissionDetail = lazy(() => import('@/pages/company/SubmissionDetail').then(m => ({ default: m.CompanySubmissionDetail })))
const CompanyMessages         = lazy(() => import('@/pages/company/CompanyMessages').then(m => ({ default: m.CompanyMessages })))

const ChallengesPage          = lazy(() => import('@/pages/ChallengesPage').then(m => ({ default: m.ChallengesPage })))
const ChallengeDetail         = lazy(() => import('@/pages/ChallengeDetail').then(m => ({ default: m.ChallengeDetail })))

const AdminDashboard          = lazy(() => import('@/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const UserManagement          = lazy(() => import('@/pages/admin/UserManagement').then(m => ({ default: m.UserManagement })))
const UserDetail              = lazy(() => import('@/pages/admin/UserDetail').then(m => ({ default: m.UserDetail })))
const ContentManagement       = lazy(() => import('@/pages/admin/ContentManagement').then(m => ({ default: m.ContentManagement })))
const ChallengeModeration     = lazy(() => import('@/pages/admin/ChallengeModeration').then(m => ({ default: m.ChallengeModeration })))
const SystemMonitoring        = lazy(() => import('@/pages/admin/SystemMonitoring').then(m => ({ default: m.SystemMonitoring })))

// ── Shared loading screen ─────────────────────────────────────────────────
function AppLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: '#F6F5F0' }}>
      <svg viewBox="0 0 32 32" width="40" height="40" fill="none"
        style={{ color: '#0F4C5C', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
        <rect x="2" y="2" width="28" height="28" rx="7" fill="currentColor"/>
        <path d="M9 20.5L16 9l7 11.5H17.5L16 18l-1.5 2.5H9z" fill="#fff"/>
        <circle cx="16" cy="22.5" r="1.5" fill="#fff"/>
      </svg>
      <div style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8A857D' }}>
        Loading…
      </div>
    </div>
  )
}

// ── Layout wrapper ────────────────────────────────────────────────────────
function AppLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>
}

// ── Root redirect based on role ───────────────────────────────────────────
function RootRedirect() {
  const { user, role, loading } = useAuthStore()
  if (loading) return <AppLoader />
  if (!user)             return <Navigate to="/login"            replace />
  if (role === 'mentor') return <Navigate to="/mentor/dashboard" replace />
  if (role === 'company')return <Navigate to="/company/dashboard"replace />
  if (role === 'admin')  return <Navigate to="/admin/dashboard"  replace />
  return                        <Navigate to="/dashboard"        replace />
}

// ─────────────────────────────────────────────────────────────────────────
export default function App() {
  const { checkAuth } = useAuthStore()
  useEffect(() => { checkAuth() }, [checkAuth])

  return (
    <Suspense fallback={<AppLoader />}>
      <Routes>
        {/* ── Public ── */}
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/signup"          element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Public portfolio — no auth required */}
        <Route path="/portfolio/:publicUrl" element={<PublicPortfolioPage />} />

        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* ── Student ── */}
        <Route path="/dashboard" element={
          <StudentRoute><AppLayout><Dashboard /></AppLayout></StudentRoute>
        }/>
        <Route path="/modules" element={
          <StudentRoute><AppLayout><ModulesPage /></AppLayout></StudentRoute>
        }/>
        <Route path="/modules/:id" element={
          <StudentRoute><AppLayout><ModuleDetailPage /></AppLayout></StudentRoute>
        }/>
        <Route path="/projects" element={
          <StudentRoute><AppLayout><ProjectsPage /></AppLayout></StudentRoute>
        }/>
        <Route path="/projects/:id" element={
          <StudentRoute><AppLayout><ProjectDetailPage /></AppLayout></StudentRoute>
        }/>
        <Route path="/progress" element={
          <StudentRoute><AppLayout><ProgressPage /></AppLayout></StudentRoute>
        }/>
        <Route path="/mentorship" element={
          <StudentRoute><AppLayout><MentorshipPage /></AppLayout></StudentRoute>
        }/>
        <Route path="/portfolio" element={
          <StudentRoute><AppLayout><PortfolioPage /></AppLayout></StudentRoute>
        }/>
        <Route path="/independent-projects" element={
          <StudentRoute><AppLayout><IndependentProjectsPage /></AppLayout></StudentRoute>
        }/>
        <Route path="/challenges" element={
          <StudentRoute><AppLayout><ChallengesPage /></AppLayout></StudentRoute>
        }/>
        <Route path="/challenges/:id" element={
          <StudentRoute><AppLayout><ChallengeDetail /></AppLayout></StudentRoute>
        }/>

        {/* ── Mentor ── */}
        <Route path="/mentor/dashboard" element={
          <MentorRoute><AppLayout><MentorDashboard /></AppLayout></MentorRoute>
        }/>
        <Route path="/mentor/submissions" element={
          <MentorRoute><AppLayout><SubmissionsPage /></AppLayout></MentorRoute>
        }/>
        <Route path="/mentor/submissions/:id" element={
          <MentorRoute><AppLayout><SubmissionDetail /></AppLayout></MentorRoute>
        }/>
        <Route path="/mentor/mentorship-requests" element={
          <MentorRoute><AppLayout><MentorshipRequests /></AppLayout></MentorRoute>
        }/>
        <Route path="/mentor/messages" element={
          <MentorRoute><AppLayout><MessagesPage /></AppLayout></MentorRoute>
        }/>

        {/* ── Company ── */}
        <Route path="/company/dashboard" element={
          <CompanyRoute><AppLayout><CompanyDashboard /></AppLayout></CompanyRoute>
        }/>
        <Route path="/company/profile" element={
          <CompanyRoute><AppLayout><CompanyProfilePage /></AppLayout></CompanyRoute>
        }/>
        <Route path="/company/post-challenge" element={
          <CompanyRoute><AppLayout><PostChallenge /></AppLayout></CompanyRoute>
        }/>
        <Route path="/company/challenges" element={
          <CompanyRoute><AppLayout><MyChallenges /></AppLayout></CompanyRoute>
        }/>
        <Route path="/company/challenges/:id/edit" element={
          <CompanyRoute><AppLayout><EditChallenge /></AppLayout></CompanyRoute>
        }/>
        <Route path="/company/submissions" element={
          <CompanyRoute><AppLayout><CompanySubmissions /></AppLayout></CompanyRoute>
        }/>
        <Route path="/company/submissions/:id" element={
          <CompanyRoute><AppLayout><CompanySubmissionDetail /></AppLayout></CompanyRoute>
        }/>
        <Route path="/company/messages" element={
          <CompanyRoute><AppLayout><CompanyMessages /></AppLayout></CompanyRoute>
        }/>

        {/* ── Admin ── */}
        <Route path="/admin/dashboard" element={
          <AdminRoute><AppLayout><AdminDashboard /></AppLayout></AdminRoute>
        }/>
        <Route path="/admin/users" element={
          <AdminRoute><AppLayout><UserManagement /></AppLayout></AdminRoute>
        }/>
        <Route path="/admin/users/:id" element={
          <AdminRoute><AppLayout><UserDetail /></AppLayout></AdminRoute>
        }/>
        <Route path="/admin/content" element={
          <AdminRoute><AppLayout><ContentManagement /></AppLayout></AdminRoute>
        }/>
        <Route path="/admin/challenges" element={
          <AdminRoute><AppLayout><ChallengeModeration /></AppLayout></AdminRoute>
        }/>
        <Route path="/admin/monitoring" element={
          <AdminRoute><AppLayout><SystemMonitoring /></AppLayout></AdminRoute>
        }/>

        {/* ── Shared authenticated ── */}
        <Route path="/messages" element={
          <AuthRoute><AppLayout><MessagesPage /></AppLayout></AuthRoute>
        }/>
        <Route path="/profile" element={
          <AuthRoute><AppLayout><PlaceholderPage title="Profile" /></AppLayout></AuthRoute>
        }/>
        <Route path="/notifications" element={
          <AuthRoute><AppLayout><PlaceholderPage title="Notifications" /></AppLayout></AuthRoute>
        }/>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
