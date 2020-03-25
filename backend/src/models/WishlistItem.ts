export interface WishlistItem {
  userId: string
  wishlistItemId: string
  createdAt: string
  name: string
  reason: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
