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

const MentorDashboard      = lazy(() => import('@/pages/mentor/MentorDashboard').then(m => ({ default: m.MentorDashboard })))
const CompanyDashboard     = lazy(() => import('@/pages/company/CompanyDashboard').then(m => ({ default: m.CompanyDashboard })))
const AdminDashboard       = lazy(() => import('@/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))

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
          <StudentRoute><AppLayout><PlaceholderPage title="Industry Challenges" description="Browse and submit to real industry challenges." /></AppLayout></StudentRoute>
        }/>
        <Route path="/challenges/:id" element={
          <StudentRoute><AppLayout><PlaceholderPage title="Challenge Detail" /></AppLayout></StudentRoute>
        }/>

        {/* ── Mentor ── */}
        <Route path="/mentor/dashboard" element={
          <MentorRoute><AppLayout><MentorDashboard /></AppLayout></MentorRoute>
        }/>
        <Route path="/mentor/submissions" element={
          <MentorRoute><AppLayout><PlaceholderPage title="Student Submissions" /></AppLayout></MentorRoute>
        }/>
        <Route path="/mentor/mentorship-requests" element={
          <MentorRoute><AppLayout><PlaceholderPage title="Mentorship Requests" /></AppLayout></MentorRoute>
        }/>
        <Route path="/mentor/messages" element={
          <MentorRoute><AppLayout><PlaceholderPage title="Messages" /></AppLayout></MentorRoute>
        }/>

        {/* ── Company ── */}
        <Route path="/company/dashboard" element={
          <CompanyRoute><AppLayout><CompanyDashboard /></AppLayout></CompanyRoute>
        }/>
        <Route path="/company/post-challenge" element={
          <CompanyRoute><AppLayout><PlaceholderPage title="Post a Challenge" /></AppLayout></CompanyRoute>
        }/>
        <Route path="/company/challenges" element={
          <CompanyRoute><AppLayout><PlaceholderPage title="My Challenges" /></AppLayout></CompanyRoute>
        }/>
        <Route path="/company/submissions" element={
          <CompanyRoute><AppLayout><PlaceholderPage title="Submissions" /></AppLayout></CompanyRoute>
        }/>

        {/* ── Admin ── */}
        <Route path="/admin/dashboard" element={
          <AdminRoute><AppLayout><AdminDashboard /></AppLayout></AdminRoute>
        }/>
        <Route path="/admin/users" element={
          <AdminRoute><AppLayout><PlaceholderPage title="User Management" /></AppLayout></AdminRoute>
        }/>
        <Route path="/admin/content" element={
          <AdminRoute><AppLayout><PlaceholderPage title="Content Management" /></AppLayout></AdminRoute>
        }/>
        <Route path="/admin/challenges" element={
          <AdminRoute><AppLayout><PlaceholderPage title="Challenge Moderation" /></AppLayout></AdminRoute>
        }/>
        <Route path="/admin/monitoring" element={
          <AdminRoute><AppLayout><PlaceholderPage title="System Monitoring" /></AppLayout></AdminRoute>
        }/>

        {/* ── Shared authenticated ── */}
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
