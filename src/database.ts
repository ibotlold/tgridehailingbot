import * as mongoDB from 'mongodb';
import { Config } from './config'
import DriverEntity from './dao/driver/driver-entity';
import RequestEntity from './dao/request/request-entity'
import UserEntity from './dao/user/user-entity';
import mongoDAO from './mongo/dao-impl';

export const collections: {
  users?: mongoDAO<UserEntity>
  drivers?: mongoDAO<DriverEntity>
  requests?: mongoDAO<RequestEntity>
} = {}

export async function connectToDatabase() {
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(Config.MONGODB_URL())
  await client.connect()
  const db: mongoDB.Db = client.db()
  const usersCollection = db.collection<UserEntity>('users')
  collections.users = new mongoDAO(usersCollection)
  const driversCollection = db.collection<DriverEntity>('drivers')
  collections.drivers = new mongoDAO(driversCollection)
  const requestCollection = db.collection<RequestEntity>('requests')
  collections.requests = new mongoDAO(requestCollection)
}