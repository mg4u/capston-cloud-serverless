/**
 * Fields in a request to update a single WISHLIST item.
 */
export interface UpdateWishlistItemRequest {
  name: string
  reason: string
  dueDate: string
  done: boolean
}