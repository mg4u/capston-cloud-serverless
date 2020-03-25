import { apiEndpoint } from '../config'
import { WishlistItem } from '../types/WishlistItem';
import { CreateWishlistItemRequest } from '../types/CreateWishlistItemRequest';
import Axios from 'axios'
import { UpdateWishlistItemRequest } from '../types/UpdateWishlistItemRequest';

export async function getWishlist(idToken: string): Promise<WishlistItem[]> {
  // console.log('Fetching wishlist')

  const response = await Axios.get(`${apiEndpoint}/wishlist`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  // console.log('Wishlist:', response.data)
  return response.data.items
}

export async function createWishlistItem(
  idToken: string,
  newWishlistItem: CreateWishlistItemRequest
): Promise<WishlistItem> {
  const response = await Axios.post(`${apiEndpoint}/wishlist`,  JSON.stringify(newWishlistItem), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchWishlistItem(
  idToken: string,
  wishlistItemId: string,
  updatedWishlistItem: UpdateWishlistItemRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/wishlist/${wishlistItemId}`, JSON.stringify(updatedWishlistItem), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteWishlistItem(
  idToken: string,
  wishlistItemId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/wishlist/${wishlistItemId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  wishlistItemId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/wishlist/${wishlistItemId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
