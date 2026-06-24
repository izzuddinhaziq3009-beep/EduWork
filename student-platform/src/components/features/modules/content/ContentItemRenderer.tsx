import { TextContent } from './TextContent'
import { VideoContent } from './VideoContent'
import { PDFContent } from './PDFContent'
import { ImageContent } from './ImageContent'
import { contentTypeIcon } from './contentTypeIcon'
import type { ContentItemType } from '@/types'

interface Piece {
  content_type: ContentItemType
  title: string
  content_text?: string | null
  file_url?: string | null
  description?: string | null
}

interface Props {
  item: Piece
}

export function ContentItemRenderer({ item }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="shrink-0" style={{ color: 'var(--primary)' }}>{contentTypeIcon(item.content_type)}</span>
        <h3 className="text-[16px] font-semibold">{item.title}</h3>
      </div>
      {item.description && <p className="text-[13.5px] muted leading-relaxed">{item.description}</p>}
      {item.content_type === 'text'  && <TextContent  content={item.content_text ?? ''} />}
      {item.content_type === 'video' && <VideoContent url={item.file_url ?? ''} />}
      {item.content_type === 'pdf'   && <PDFContent   url={item.file_url ?? ''} title={item.title} />}
      {item.content_type === 'image' && <ImageContent url={item.file_url ?? ''} title={item.title} />}
    </div>
  )
}
