import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { deleteWishlistItem } from '../../businessLogic/wishlist'
import { getUserId } from '../utils'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const wishlistItemId = event.pathParameters.wishlistItemId

  console.log('Processing delete wishlistItem event: ', event)
  const userId = getUserId(event);

  await deleteWishlistItem(wishlistItemId, userId)
  console.log('WishlistItem deleted successfully: ', wishlistItemId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      wishlistItemId
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
