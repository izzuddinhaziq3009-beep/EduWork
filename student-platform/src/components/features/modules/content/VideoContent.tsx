import { getVideoEmbedUrl } from './videoUtils'

interface Props {
  url: string
}

export function VideoContent({ url }: Props) {
  if (!url) return null
  const embedUrl = getVideoEmbedUrl(url)

  return (
    <div className="rounded-2xl overflow-hidden hairline aspect-video" style={{ background: '#000' }}>
      {embedUrl ? (
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video content"
        />
      ) : (
        <video src={url} controls className="w-full h-full" />
      )}
    </div>
  )
}
