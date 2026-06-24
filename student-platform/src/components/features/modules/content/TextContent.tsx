interface Props {
  content: string
}

export function TextContent({ content }: Props) {
  if (!content) return null
  return <p className="text-[15px] leading-relaxed ink-2 whitespace-pre-wrap">{content}</p>
}
