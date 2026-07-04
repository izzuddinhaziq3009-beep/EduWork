import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useMyCertificates } from '@/hooks/useCertificates'
import { Certificate } from '@/components/features/certificates/Certificate'
import { Skeleton } from '@/components/ui/skeleton'
import type { Certificate as CertType } from '@/types'

// ── PageHeader ────────────────────────────────────────────────────────────────

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-[28px] font-bold leading-tight">{title}</h1>
      <p className="muted text-[14px] mt-1">{subtitle}</p>
    </div>
  )
}

// ── PDF export — serialize SVG → canvas → jsPDF ───────────────────────────────
// html2canvas can't reliably render inline SVG; instead we serialize the SVG
// element to a data URL, draw it onto a canvas, and feed that to jsPDF.

const SVG_W = 680
const SVG_H = 470

async function downloadPdf(cert: CertType) {
  const { default: jsPDF } = await import('jspdf')

  const svgEl = document.getElementById(`cert-${cert.id}`) as SVGSVGElement | null
  if (!svgEl) return

  // Serialize with explicit namespace so browsers accept it as an image source
  const serializer = new XMLSerializer()
  let svgStr = serializer.serializeToString(svgEl)
  if (!svgStr.includes('xmlns=')) {
    svgStr = svgStr.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  }
  const svgData = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr)

  // Render at 2× for crisp PDF output
  const SCALE = 2
  const canvas = document.createElement('canvas')
  canvas.width  = SVG_W * SCALE
  canvas.height = SVG_H * SCALE
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  await new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.onload  = () => { ctx.drawImage(img, 0, 0, canvas.width, canvas.height); resolve() }
    img.onerror = reject
    img.src = svgData
  })

  // Centre the certificate on an A4 landscape page with a small margin
  const pdf  = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pdfW = pdf.internal.pageSize.getWidth()   // 297 mm
  const pdfH = pdf.internal.pageSize.getHeight()  // 210 mm
  const PAD  = 8
  const maxW = pdfW - PAD * 2
  const maxH = pdfH - PAD * 2
  const ratio = SVG_W / SVG_H
  let w = maxW, h = maxW / ratio
  if (h > maxH) { h = maxH; w = maxH * ratio }
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', (pdfW - w) / 2, (pdfH - h) / 2, w, h)
  pdf.save(`certificate-${cert.certificate_code}.pdf`)
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function CertModal({ cert, onClose }: { cert: CertType; onClose: () => void }) {
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    try { await downloadPdf(cert) } finally { setDownloading(false) }
  }

  const issuedDate = new Date(cert.issued_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 p-6"
      style={{ background: 'rgba(15,23,42,0.72)' }}
      onClick={onClose}
    >
      {/* Certificate preview — constrained width so it fits most viewports */}
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 740 }}
      >
        <Certificate
          id={`cert-${cert.id}`}
          studentName={cert.student_name}
          moduleTitle={cert.module_title}
          issuedDate={issuedDate}
          certificateCode={cert.certificate_code}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="h-10 px-5 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: '#4F46E5' }}
        >
          {downloading ? 'Generating PDF…' : 'Download PDF'}
        </button>
        <button
          onClick={onClose}
          className="h-10 px-5 rounded-xl text-[13px] font-semibold hairline hover:opacity-80 transition-opacity"
        >
          Close
        </button>
      </div>
    </div>
  )
}

// ── Card thumbnail ────────────────────────────────────────────────────────────
// Renders the real Certificate SVG inside a clipped container so the card
// preview is pixel-identical to the full view (just cropped to show the header
// section that contains logo, title, and student name).

function CertCard({ cert, onView }: { cert: CertType; onView: (c: CertType) => void }) {
  const issuedDate = new Date(cert.issued_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden flex flex-col hover:shadow-pop transition-shadow">
      {/* SVG thumbnail — overflow:hidden clips to the top ~65% of the cert */}
      <div style={{ height: 148, overflow: 'hidden', background: '#fff', flexShrink: 0 }}>
        <Certificate
          studentName={cert.student_name}
          moduleTitle={cert.module_title}
          issuedDate={issuedDate}
          certificateCode={cert.certificate_code}
        />
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="min-w-0">
          <h3 className="text-[14px] font-semibold leading-tight line-clamp-2">{cert.module_title}</h3>
          <p className="text-[12px] muted mt-1">{issuedDate}</p>
        </div>
        <p className="font-mono text-[11px] muted">{cert.certificate_code}</p>

        <div className="flex items-center gap-2 mt-auto pt-1">
          <button
            onClick={() => onView(cert)}
            className="flex-1 h-8 rounded-lg text-[12px] font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: '#4F46E5' }}
          >
            View
          </button>
          <a
            href={`/verify/${cert.certificate_code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-8 rounded-lg text-[12px] font-semibold text-center flex items-center justify-center hairline hover:opacity-80 transition-opacity"
            style={{ color: '#4F46E5' }}
          >
            Verify
          </a>
        </div>
      </div>
    </div>
  )
}

function CertCardSkeleton() {
  return (
    <div className="bg-surface hairline rounded-2xl shadow-card overflow-hidden">
      <Skeleton className="h-[148px] w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-full mt-2" />
      </div>
    </div>
  )
}

// ── CertificatesTabContent — content only, no page wrapper ───────────────────

export function CertificatesTabContent() {
  const { user } = useAuthStore()
  const { data: certs, isLoading } = useMyCertificates(user?.id ?? '')
  const [viewing, setViewing] = useState<CertType | null>(null)

  return (
    <>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <CertCardSkeleton key={i} />)}
        </div>
      ) : !certs?.length ? (
        <div className="hairline rounded-2xl p-12 text-center" style={{ background: 'var(--hair-2)' }}>
          <div className="text-[40px] mb-4">🎓</div>
          <h2 className="text-[18px] font-semibold">No certificates yet</h2>
          <p className="muted text-[14px] mt-2 max-w-sm mx-auto">
            Complete a learning module to earn your first certificate.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {certs.map(cert => (
            <CertCard key={cert.id} cert={cert} onView={setViewing} />
          ))}
        </div>
      )}

      {viewing && <CertModal cert={viewing} onClose={() => setViewing(null)} />}
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function StudentCertificates() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <PageHeader
        title="My Certificates"
        subtitle="Certificates you've earned by completing learning modules."
      />
      <CertificatesTabContent />
    </div>
  )
}
