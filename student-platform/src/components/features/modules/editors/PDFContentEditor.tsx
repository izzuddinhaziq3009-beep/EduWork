import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { uploadModuleFile } from '@/services/moduleService'
import { useToast } from '@/hooks/use-toast'

interface Props {
  value: string
  onChange: (url: string) => void
}

export function PDFContentEditor({ value, onChange }: Props) {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File) => {
    if (!user) return
    setUploading(true)
    try {
      const url = await uploadModuleFile(file, user.id)
      onChange(url)
    } catch (err) {
      toast({ title: 'Upload failed', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-[12.5px] font-medium ink-2 block mb-1.5">PDF file</label>
      <input type="file" accept="application/pdf" disabled={uploading}
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="text-[13px]" />
      {uploading && <p className="text-[12.5px] muted">Uploading…</p>}
      {value && !uploading && (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-medium block"
          style={{ color: 'var(--primary)' }}>
          ✓ File uploaded — view
        </a>
      )}
    </div>
  )
}
