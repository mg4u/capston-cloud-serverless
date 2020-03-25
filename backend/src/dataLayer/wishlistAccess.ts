import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import {WishlistItem } from '../models/WishlistItem'
import { WishlistItemUpdate } from '../models/WishlistItemUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

export class WishlistAccess {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly wishlistTable = process.env.WISHLIST_TABLE,
        private readonly userIdIndex = process.env.USER_ID_INDEX
    ) {}
    
    async getAllWishlist(userId: string): Promise<WishlistItem[]> {
        console.log('getting all wishlist for user with ID: ', userId)
        const result = await this.docClient.query({
            TableName: this.wishlistTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        console.log('fecthed wishlist: ', result);

        const items = result.Items
        console.log('wishlist access items ', items)
        return items as WishlistItem[]
    }

    async createWishlistItem(wishlistItemItem:WishlistItem): Promise<WishlistItem> {
        console.log('creating wishlistItem item: ', wishlistItemItem)

        await this.docClient.put({
          TableName: this.wishlistTable,
          Item: wishlistItemItem
        }).promise()
    
        console.log('item created successfully')
        return wishlistItemItem
    }

    async updateWishlistItem(wishlistItemItem: WishlistItemUpdate, wishlistItemId: string, userId: string): Promise<WishlistItemUpdate>{
        console.log('updating wishlistItem item with Id: ', wishlistItemId)

        await this.docClient.update({
            TableName: this.wishlistTable,
            Key: {
                userId,
                wishlistItemId
            },
            UpdateExpression: "set #n = :name, reason = :reason, dueDate = :dueDate, done = :done",
            ExpressionAttributeValues: {
                ":name": wishlistItemItem.name,
                ":reason": wishlistItemItem.reason,
                ":dueDate": wishlistItemItem.dueDate,
                ":done": wishlistItemItem.done 
            },
            ExpressionAttributeNames: {
                "#n": 'name'
                // name conflicts with dynamos reserved words: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
            }
        }).promise()

        console.log('item updated successfully')  
        return wishlistItemItem
    }

    async deleteWishlistItem(wishlistItemId: string, userId: string): Promise<any> {
        console.log('deleting wishlistItem item with Id: ', wishlistItemId)
        await this.docClient.delete({
            TableName: this.wishlistTable,
            Key: {
              userId,
              wishlistItemId
            }
          }).promise()

        console.log('item deleted successfully')
      return null;
    }

}