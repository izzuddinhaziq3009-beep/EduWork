interface Props {
  url: string
  title: string
}

export function ImageContent({ url, title }: Props) {
  if (!url) return null
  return (
    <div className="rounded-2xl overflow-hidden hairline">
      <img src={url} alt={title} className="w-full max-h-[520px] object-contain bg-[var(--hair-2)]" />
    </div>
  )
}
