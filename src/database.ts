import * as mongoDB from 'mongodb';
import { Config } from './config'
import Driver from './models/driver';
import UserModel from './models/user';

export const collections: {
    users?: mongoDB.Collection<UserModel>
    drivers?: mongoDB.Collection<Driver>
} = {}

export async function connectToDatabase() {
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(Config.MONGODB_URL())
    await client.connect()
    const db: mongoDB.Db = client.db()
    const usersCollection = db.collection<UserModel>('users')
    collections.users = usersCollection
    const driversCollection = db.collection<Driver>('drivers')
    collections.drivers = driversCollection
}