import * as uuid from 'uuid'
import {WishlistItem } from '../models/WishlistItem'
import { WishlistItemUpdate } from '../models/WishlistItemUpdate'
import { CreateWishlistItemRequest } from '../requests/CreateWishlistItemRequest'
import { UpdateWishlistItemRequest } from '../requests/UpdateWishlistItemRequest'
import {WishlistAccess } from '../dataLayer/wishlistAccess'

const wishlistItemBucket = process.env.ATTACHMENT_S3_BUCKET

const wishlistAccess = new WishlistAccess()

export async function getAllWishlist(userId: string): Promise<WishlistItem[]> {
    console.log('BUSINESS LOGIC - get all wishlist')
   const items = await wishlistAccess.getAllWishlist(userId)
   console.log('BUSINESS LOGIC - items retrived ', items)
   return items
 }


export async function createWishlistItem(createWishlistItemRequest: CreateWishlistItemRequest, userId: string): Promise<WishlistItem> {
    console.log('BUSINESS LOGIC - create wishlistItem')
  
    const itemId = uuid.v4()
  
    return await wishlistAccess.createWishlistItem({
      userId: userId,
      wishlistItemId: itemId,
      createdAt: new Date().toISOString(),
      name: createWishlistItemRequest.name,
      reason: createWishlistItemRequest.reason,
      dueDate: createWishlistItemRequest.dueDate,
      done: false,
      attachmentUrl: `https://${wishlistItemBucket}.s3.amazonaws.com/${itemId}`
    })
  }

  export async function updateWishlistItem(updateWishlistItemRequest: UpdateWishlistItemRequest, wishlistItemId: string, userId: string): Promise<WishlistItemUpdate> {
    console.log('BUSINESS LOGIC - update wishlistItem')
    return await wishlistAccess.updateWishlistItem(updateWishlistItemRequest, wishlistItemId, userId)
  }

  export async function deleteWishlistItem(wishlistItemId: string, userId: string): Promise<any> {
    console.log('BUSINESS LOGIC - delete wishlistItem')
    return await wishlistAccess.deleteWishlistItem(wishlistItemId, userId)
  }