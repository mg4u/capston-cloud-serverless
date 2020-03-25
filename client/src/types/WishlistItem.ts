export interface WishlistItem {
  wishlistItemId: string
  createdAt: string
  name: string
  reason: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
