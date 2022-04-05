import * as mongoDB from 'mongodb';
import { Config } from './config'
import CarModel from './models/cars';
import DriverModel from './models/drivers';
import UserModel from './models/user';

export const collections: {
    users?: mongoDB.Collection<UserModel>
    drivers?: mongoDB.Collection<DriverModel>
    cars?: mongoDB.Collection<CarModel>
} = {}

export async function connectToDatabase() {
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(Config.MONGODB_URL())
    await client.connect()
    const db: mongoDB.Db = client.db()
    const usersCollection = db.collection<UserModel>('users')
    collections.users = usersCollection
    const driversCollection = db.collection<DriverModel>('drivers')
    collections.drivers = driversCollection
    const carsCollection = db.collection<CarModel>('cars')
    collections.cars = carsCollection
}