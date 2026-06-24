import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { uploadModuleFile } from '@/services/moduleService'
import { useToast } from '@/hooks/use-toast'

interface Props {
  value: string
  onChange: (url: string) => void
}

export function ImageContentEditor({ value, onChange }: Props) {
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
      <label className="text-[12.5px] font-medium ink-2 block mb-1.5">Image file</label>
      <input type="file" accept="image/*" disabled={uploading}
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="text-[13px]" />
      {uploading && <p className="text-[12.5px] muted">Uploading…</p>}
      {value && !uploading && (
        <img src={value} alt="Preview" className="max-h-40 rounded-lg hairline" />
      )}
    </div>
  )
}
