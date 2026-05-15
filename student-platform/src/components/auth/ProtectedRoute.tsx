import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { UserRole } from '@/types'

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <svg viewBox="0 0 32 32" width="40" height="40" fill="none" className="animate-pulse" style={{ color: 'var(--primary)' }}>
          <rect x="2" y="2" width="28" height="28" rx="7" fill="currentColor"/>
          <path d="M9 20.5L16 9l7 11.5H17.5L16 18l-1.5 2.5H9z" fill="#fff"/>
          <circle cx="16" cy="22.5" r="1.5" fill="#fff"/>
        </svg>
        <div className="font-mono text-[12px] muted tracking-widest uppercase">Loading…</div>
      </div>
    </div>
  )
}

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuthStore()
  const location = useLocation()

  if (loading) return <LoadingSpinner />

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to the correct dashboard for this role
    if (role === 'mentor')  return <Navigate to="/mentor/dashboard" replace />
    if (role === 'company') return <Navigate to="/company/dashboard" replace />
    if (role === 'admin')   return <Navigate to="/admin/dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export function StudentRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={['student']}>{children}</ProtectedRoute>
}

export function MentorRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={['mentor']}>{children}</ProtectedRoute>
}

export function CompanyRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={['company']}>{children}</ProtectedRoute>
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={['admin']}>{children}</ProtectedRoute>
}

// Any authenticated user (for shared routes like /profile)
export function AuthRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
