import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getAllWishlist } from '../../businessLogic/wishlist'
import { getUserId } from '../utils'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

export const handler = middy(async ( event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get allWISHLIST items for a current user

  console.log('Processing get allWISHLIST items event: ', event)
  const userId = getUserId(event);

  const items = await getAllWishlist(userId)
  console.log('Get allWISHLIST items for a current user ', userId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      items
    })
  }

})

handler.use(
  cors({
    credentials: true
  })
)
