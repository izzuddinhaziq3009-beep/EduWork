import { useAuthStore } from '@/stores/authStore'
import { useUploadModuleImage } from '@/hooks/useModules'

interface Props {
  value: string | null
  onChange: (url: string | null) => void
}

export function ModuleImageUploader({ value, onChange }: Props) {
  const { user } = useAuthStore()
  const upload = useUploadModuleImage()

  const handleFile = (file: File) => {
    if (!user) return
    upload.mutate({ file, adminId: user.id }, { onSuccess: url => onChange(url) })
  }

  return (
    <div className="space-y-2.5">
      <label className="text-[12.5px] font-medium ink-2 block">Module thumbnail <span className="muted font-normal">(optional)</span></label>

      <div className="hairline rounded-xl overflow-hidden" style={{ background: 'var(--hair-2)' }}>
        {value ? (
          <div className="relative">
            <img src={value} alt="Module thumbnail preview" className="w-full h-[160px] object-cover" />
            <button type="button" onClick={() => onChange(null)}
              className="absolute top-2 right-2 w-7 h-7 rounded-lg grid place-items-center bg-black/50 text-white hover:bg-black/70 transition-colors"
              title="Remove image">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </div>
        ) : (
          <div className="h-[160px] flex flex-col items-center justify-center gap-1.5 text-[color:var(--muted)]">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            <span className="text-[12px]">No thumbnail uploaded</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <label className="h-9 px-3.5 rounded-lg hairline text-[12.5px] font-semibold hover:bg-[var(--hair-2)] cursor-pointer transition-colors inline-flex items-center gap-1.5">
          {upload.isPending ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
          <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" disabled={upload.isPending}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        </label>
        <span className="text-[11.5px] muted">JPG, PNG, or WEBP · up to 5MB · 600×400 recommended</span>
      </div>
    </div>
  )
}
