import * as mongoDB from 'mongodb';
import { Config } from './config'

export const collections: {
    users?: mongoDB.Collection
} = {}

export async function connectToDatabase() {
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(Config.MONGODB_URL())
    await client.connect()
    const db: mongoDB.Db = client.db()
    const usersCollection: mongoDB.Collection = db.collection('users')
    collections.users = usersCollection
    
}