import * as mongoDB from 'mongodb';
import { Config } from './config'
import UserModel from './models/user';

export const collections: {
    users?: mongoDB.Collection<UserModel>
} = {}

export async function connectToDatabase() {
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(Config.MONGODB_URL())
    await client.connect()
    const db: mongoDB.Db = client.db()
    const usersCollection = db.collection<UserModel>('users')
    collections.users = usersCollection
    
}