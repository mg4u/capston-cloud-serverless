import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateWishlistItemRequest } from '../../requests/UpdateWishlistItemRequest'
import { updateWishlistItem } from '../../businessLogic/wishlist'
import { getUserId } from '../utils'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

export const handler = middy(async ( event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const wishlistItemId = event.pathParameters.wishlistItemId
  const updatedWishlistItem: UpdateWishlistItemRequest = JSON.parse(event.body)

  console.log('Processing update wishlistItem event: ', event)
  const userId = getUserId(event)

  await updateWishlistItem(updatedWishlistItem, wishlistItemId, userId)
  console.log('WishlistItem updated successfully: ', wishlistItemId)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: null
  }
})

handler.use(
  cors({
    credentials: true
  })
)
