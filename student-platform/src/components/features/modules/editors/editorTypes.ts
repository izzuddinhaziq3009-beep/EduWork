import type { ContentPieceInput } from '@/services/moduleService'
import type { ContentItemType } from '@/types'

// Local-only `_key` lets the UI track unsaved content pieces (no DB `id` yet)
// before they're persisted. Stripped out right before saving.
export type EditableItem = ContentPieceInput & { _key: string }

function newKey(): string {
  return crypto.randomUUID()
}

export function newItem(type: ContentItemType, orderIndex: number): EditableItem {
  return { _key: newKey(), content_type: type, title: '', description: '', content_text: '', file_url: '', order_index: orderIndex }
}

export function pieceToEditable(piece: ContentPieceInput): EditableItem {
  return { ...piece, _key: piece.id ?? newKey() }
}

export function toContentPieceInput(item: EditableItem): ContentPieceInput {
  const { id, content_type, title, description, content_text, file_url, order_index } = item
  return {
    ...(id ? { id } : {}),
    content_type, title, description, content_text, file_url, order_index,
  }
}
