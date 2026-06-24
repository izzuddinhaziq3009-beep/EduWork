import { parseSimpleContent } from '@/services/moduleService'
import { TextContent } from './content/TextContent'
import { VideoContent } from './content/VideoContent'
import { PDFContent } from './content/PDFContent'
import { ImageContent } from './content/ImageContent'
import type { LearningModule } from '@/types'

interface Props {
  module: LearningModule
}

export function SimpleModuleView({ module }: Props) {
  const { text, attachments } = parseSimpleContent(module.simple_content)

  if (!text && attachments.length === 0) {
    return <p className="text-[14px] muted">Module content will appear here once the instructor adds it.</p>
  }

  return (
    <div className="space-y-6">
      {text && <TextContent content={text} />}
      {attachments.map((a, i) => (
        <div key={`${a.url}-${i}`}>
          {a.type === 'video' && <VideoContent url={a.url} />}
          {a.type === 'pdf'   && <PDFContent url={a.url} title={a.title} />}
          {a.type === 'image' && <ImageContent url={a.url} title={a.title} />}
        </div>
      ))}
    </div>
  )
}
