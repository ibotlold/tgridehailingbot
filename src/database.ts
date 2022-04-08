import * as mongoDB from 'mongodb';
import { Config } from './config'
import DriverEntity from './dao/driver/driver-entity';
import UserEntity from './dao/user/user-entity';

export const collections: {
    users?: mongoDB.Collection<UserEntity>
    drivers?: mongoDB.Collection<DriverEntity>
} = {}

export async function connectToDatabase() {
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(Config.MONGODB_URL())
    await client.connect()
    const db: mongoDB.Db = client.db()
    const usersCollection = db.collection<UserEntity>('users')
    collections.users = usersCollection
    const driversCollection = db.collection<DriverEntity>('drivers')
    collections.drivers = driversCollection
}