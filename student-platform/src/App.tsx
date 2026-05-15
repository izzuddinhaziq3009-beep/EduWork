import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

// Auth pages
import { LoginPage }          from '@/pages/LoginPage'
import { SignupPage }         from '@/pages/SignupPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'

// Dashboard pages
import { Dashboard }         from '@/pages/Dashboard'
import { MentorDashboard }   from '@/pages/mentor/MentorDashboard'
import { CompanyDashboard }  from '@/pages/company/CompanyDashboard'
import { AdminDashboard }    from '@/pages/admin/AdminDashboard'

// Layout + route guards
import { Layout }        from '@/components/layout/Layout'
import {
  StudentRoute, MentorRoute, CompanyRoute, AdminRoute, AuthRoute,
} from '@/components/auth/ProtectedRoute'

// Shared
import { NotFoundPage }   from '@/pages/NotFoundPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'

// ─── Thin layout wrapper for protected routes ───────────────────────
function AppLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>
}

// ─── Root redirect based on role ────────────────────────────────────
function RootRedirect() {
  const { user, role, loading } = useAuthStore()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (role === 'mentor')  return <Navigate to="/mentor/dashboard"  replace />
  if (role === 'company') return <Navigate to="/company/dashboard" replace />
  if (role === 'admin')   return <Navigate to="/admin/dashboard"   replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  const { checkAuth } = useAuthStore()

  // Hydrate auth state on first load
  useEffect(() => { checkAuth() }, [checkAuth])

  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/login"            element={<LoginPage />} />
      <Route path="/signup"           element={<SignupPage />} />
      <Route path="/forgot-password"  element={<ForgotPasswordPage />} />

      {/* ── Root → role-based redirect ── */}
      <Route path="/" element={<RootRedirect />} />

      {/* ── Student routes ── */}
      <Route path="/dashboard" element={
        <StudentRoute>
          <AppLayout><Dashboard /></AppLayout>
        </StudentRoute>
      }/>
      <Route path="/modules" element={
        <StudentRoute>
          <AppLayout><PlaceholderPage title="Learning Modules" description="Browse and continue your learning modules." /></AppLayout>
        </StudentRoute>
      }/>
      <Route path="/modules/:id" element={
        <StudentRoute>
          <AppLayout><PlaceholderPage title="Module Detail" /></AppLayout>
        </StudentRoute>
      }/>
      <Route path="/projects" element={
        <StudentRoute>
          <AppLayout><PlaceholderPage title="Projects" description="Submit and track your project work." /></AppLayout>
        </StudentRoute>
      }/>
      <Route path="/projects/:id" element={
        <StudentRoute>
          <AppLayout><PlaceholderPage title="Project Detail" /></AppLayout>
        </StudentRoute>
      }/>
      <Route path="/progress" element={
        <StudentRoute>
          <AppLayout><PlaceholderPage title="My Progress" description="Track your learning journey and achievements." /></AppLayout>
        </StudentRoute>
      }/>
      <Route path="/mentorship" element={
        <StudentRoute>
          <AppLayout><PlaceholderPage title="Mentorship" description="Connect with your mentor and request guidance." /></AppLayout>
        </StudentRoute>
      }/>
      <Route path="/portfolio" element={
        <StudentRoute>
          <AppLayout><PlaceholderPage title="Portfolio" description="Build and publish your digital portfolio." /></AppLayout>
        </StudentRoute>
      }/>
      <Route path="/independent-projects" element={
        <StudentRoute>
          <AppLayout><PlaceholderPage title="Independent Projects" description="Manage your self-directed projects." /></AppLayout>
        </StudentRoute>
      }/>
      <Route path="/challenges" element={
        <StudentRoute>
          <AppLayout><PlaceholderPage title="Industry Challenges" description="Browse and submit to real industry challenges." /></AppLayout>
        </StudentRoute>
      }/>
      <Route path="/challenges/:id" element={
        <StudentRoute>
          <AppLayout><PlaceholderPage title="Challenge Detail" /></AppLayout>
        </StudentRoute>
      }/>

      {/* ── Mentor routes ── */}
      <Route path="/mentor/dashboard" element={
        <MentorRoute>
          <AppLayout><MentorDashboard /></AppLayout>
        </MentorRoute>
      }/>
      <Route path="/mentor/submissions" element={
        <MentorRoute>
          <AppLayout><PlaceholderPage title="Student Submissions" description="Review and provide feedback on student work." /></AppLayout>
        </MentorRoute>
      }/>
      <Route path="/mentor/mentorship-requests" element={
        <MentorRoute>
          <AppLayout><PlaceholderPage title="Mentorship Requests" description="Accept or decline mentorship requests." /></AppLayout>
        </MentorRoute>
      }/>
      <Route path="/mentor/messages" element={
        <MentorRoute>
          <AppLayout><PlaceholderPage title="Messages" description="Communicate with your students." /></AppLayout>
        </MentorRoute>
      }/>

      {/* ── Company routes ── */}
      <Route path="/company/dashboard" element={
        <CompanyRoute>
          <AppLayout><CompanyDashboard /></AppLayout>
        </CompanyRoute>
      }/>
      <Route path="/company/post-challenge" element={
        <CompanyRoute>
          <AppLayout><PlaceholderPage title="Post a Challenge" description="Create a new industry challenge for students." /></AppLayout>
        </CompanyRoute>
      }/>
      <Route path="/company/challenges" element={
        <CompanyRoute>
          <AppLayout><PlaceholderPage title="My Challenges" description="Manage your posted challenges." /></AppLayout>
        </CompanyRoute>
      }/>
      <Route path="/company/submissions" element={
        <CompanyRoute>
          <AppLayout><PlaceholderPage title="Submissions" description="Review submissions to your challenges." /></AppLayout>
        </CompanyRoute>
      }/>

      {/* ── Admin routes ── */}
      <Route path="/admin/dashboard" element={
        <AdminRoute>
          <AppLayout><AdminDashboard /></AppLayout>
        </AdminRoute>
      }/>
      <Route path="/admin/users" element={
        <AdminRoute>
          <AppLayout><PlaceholderPage title="User Management" description="Manage all platform users." /></AppLayout>
        </AdminRoute>
      }/>
      <Route path="/admin/content" element={
        <AdminRoute>
          <AppLayout><PlaceholderPage title="Content Management" description="Manage learning modules and projects." /></AppLayout>
        </AdminRoute>
      }/>
      <Route path="/admin/challenges" element={
        <AdminRoute>
          <AppLayout><PlaceholderPage title="Challenge Moderation" description="Approve or reject company challenge submissions." /></AppLayout>
        </AdminRoute>
      }/>
      <Route path="/admin/monitoring" element={
        <AdminRoute>
          <AppLayout><PlaceholderPage title="System Monitoring" description="Monitor platform health and activity." /></AppLayout>
        </AdminRoute>
      }/>

      {/* ── Shared authenticated routes ── */}
      <Route path="/profile" element={
        <AuthRoute>
          <AppLayout><PlaceholderPage title="Profile" description="Manage your account settings." /></AppLayout>
        </AuthRoute>
      }/>
      <Route path="/notifications" element={
        <AuthRoute>
          <AppLayout><PlaceholderPage title="Notifications" /></AppLayout>
        </AuthRoute>
      }/>

      {/* ── 404 ── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
