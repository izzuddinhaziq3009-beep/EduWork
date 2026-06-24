import { Input } from '@/components/ui/input'
import { VideoContent } from '../content/VideoContent'

interface Props {
  value: string
  onChange: (value: string) => void
}

export function VideoContentEditor({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-[12.5px] font-medium ink-2 block mb-1.5">Video URL (YouTube, Vimeo, or direct link)</label>
        <Input value={value} onChange={e => onChange(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" />
      </div>
      {value && <VideoContent url={value} />}
    </div>
  )
}
