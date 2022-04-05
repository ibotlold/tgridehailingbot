import { ObjectId } from "mongodb";

export default interface DriverModel {
    _id?: ObjectId
    userId: number,
    cars: ObjectId | ObjectId[]
}