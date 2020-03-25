import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from "aws-sdk"

const awsS3 = new AWS.S3({
  signatureVersion: 'v4'
})

const wishlistItemBucket = process.env.ATTACHMENT_S3_BUCKET
const signedUrlExpires = parseInt(process.env.SIGNED_URL_EXPIRATION)

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const wishlistItemId = event.pathParameters.wishlistItemId
  console.log('uploading attachment image...')
  // TODO: Return a presigned URL to upload a file for aWISHLIST item with the provided id
  const signedUrl = awsS3.getSignedUrl("putObject", {
    Bucket: wishlistItemBucket,
    Key: wishlistItemId,
    Expires: signedUrlExpires
  });
  console.log('singed URL generated: ', signedUrl);
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      uploadUrl: signedUrl
    })
  }
}
