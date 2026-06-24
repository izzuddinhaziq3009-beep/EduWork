import { Textarea } from '@/components/ui/textarea'

interface Props {
  value: string
  onChange: (value: string) => void
}

export function TextContentEditor({ value, onChange }: Props) {
  return (
    <div>
      <label className="text-[12.5px] font-medium ink-2 block mb-1.5">Text content</label>
      <Textarea rows={6} value={value} onChange={e => onChange(e.target.value)} placeholder="Write the lesson content here…" />
    </div>
  )
}
