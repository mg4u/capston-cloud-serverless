import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { CreateWishlistItemRequest } from '../../requests/CreateWishlistItemRequest'
import { createWishlistItem } from '../../businessLogic/wishlist'
import { getUserId } from '../utils'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing create wishlistItem event: ', event)
  const newWishlistItem: CreateWishlistItemRequest = JSON.parse(event.body)

  const newItem = await createWishlistItem(newWishlistItem, getUserId(event))
  console.log('wishlistItem created successfully: ', newItem)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: newItem
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)