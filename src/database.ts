import * as mongoDB from 'mongodb';
import { Config } from './config'
import DriverEntity from './dao/driver/driver-entity';
import UserEntity from './dao/user/user-entity';
import mongoDAO from './mongo/dao-impl';

export const collections: {
  users?: mongoDAO<UserEntity>
  drivers?: mongoDB.Collection<DriverEntity>
} = {}

export async function connectToDatabase() {
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(Config.MONGODB_URL())
  await client.connect()
  const db: mongoDB.Db = client.db()
  const usersCollection = db.collection<UserEntity>('users')
  collections.users = new mongoDAO(usersCollection)
  const driversCollection = db.collection<DriverEntity>('drivers')
  collections.drivers = driversCollection
}