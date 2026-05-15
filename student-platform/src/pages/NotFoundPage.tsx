import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function NotFoundPage() {
  const { role } = useAuthStore()
  const home = role === 'mentor' ? '/mentor/dashboard' : role === 'company' ? '/company/dashboard' : role === 'admin' ? '/admin/dashboard' : '/dashboard'

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="font-mono text-[80px] font-bold leading-none tracking-tighter"
          style={{ color: 'var(--hair)' }}>404</div>
        <h1 className="font-display text-[28px] font-semibold tracking-tight mt-2">Page not found</h1>
        <p className="muted text-[15px] mt-3 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to={role ? home : '/login'}
          className="mt-6 inline-flex items-center gap-2 text-white font-semibold text-[14px] h-11 px-6 rounded-xl transition-opacity hover:opacity-90"
          style={{ background: 'var(--primary)' }}>
          Go home
        </Link>
      </div>
    </div>
  )
}
