import { Link, useParams } from 'react-router-dom'
import { useCertificateByCode } from '@/hooks/useCertificates'
import { Certificate } from '@/components/features/certificates/Certificate'
import { Skeleton } from '@/components/ui/skeleton'

function VerifyShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg, #F8FAFC)' }}>
      {/* Minimal header */}
      <header className="h-14 px-6 flex items-center gap-3 hairline-b" style={{ background: '#fff' }}>
        <svg viewBox="0 0 32 32" width="26" height="26" fill="none">
          <rect x="2" y="2" width="28" height="28" rx="7" fill="#4F46E5" />
          <path d="M9 20.5L16 9l7 11.5H17.5L16 18l-1.5 2.5H9z" fill="#fff" />
          <circle cx="16" cy="22.5" r="1.5" fill="#fff" />
        </svg>
        <span style={{
          fontFamily:    'monospace',
          fontSize:      12,
          fontWeight:    700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:         '#4F46E5',
        }}>
          EduWork
        </span>
        <span className="muted text-[12px] ml-2">· Certificate Verification</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {children}
      </main>
    </div>
  )
}

export function VerifyCertificate() {
  const { code = '' } = useParams<{ code: string }>()
  const { data: cert, isLoading, isFetched } = useCertificateByCode(code)

  if (isLoading) {
    return (
      <VerifyShell>
        <Skeleton className="h-[637px] w-[900px] max-w-full rounded-2xl" />
      </VerifyShell>
    )
  }

  if (isFetched && !cert) {
    return (
      <VerifyShell>
        <div className="text-center max-w-md">
          <div className="font-mono text-[64px] font-bold leading-none" style={{ color: '#e2e8f0' }}>
            404
          </div>
          <h1 className="text-[22px] font-semibold mt-2">Certificate not found</h1>
          <p className="muted text-[14px] mt-2">
            The code <span className="font-mono font-semibold">{code}</span> doesn't match any
            certificate in our records. It may be private, revoked, or the code may be incorrect.
          </p>
          <Link
            to="/"
            className="mt-5 inline-block text-[13px] font-medium hover:opacity-80 transition-opacity"
            style={{ color: '#4F46E5' }}
          >
            Go to EduWork
          </Link>
        </div>
      </VerifyShell>
    )
  }

  if (!cert) return null

  const issuedDate = new Date(cert.issued_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <VerifyShell>
      {/* Verification badge */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold"
        style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
          <circle cx="10" cy="10" r="9" fill="#16a34a" opacity="0.12" />
          <path d="M6 10l3 3 5-6" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Verified Certificate
      </div>

      {/* Certificate — sized to fit viewport */}
      <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
        <Certificate
          studentName={cert.student_name}
          moduleTitle={cert.module_title}
          issuedDate={issuedDate}
          certificateCode={cert.certificate_code}
        />
      </div>

      <p className="muted text-[13px] text-center max-w-md">
        This certificate was issued by EduWork and is cryptographically verified.
        Code: <span className="font-mono font-semibold" style={{ color: '#4F46E5' }}>{cert.certificate_code}</span>
      </p>
    </VerifyShell>
  )
}
