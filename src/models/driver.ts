import { ObjectId } from "mongodb";

export default interface Driver {
  _id?: ObjectId
  userId: number,
  vehicle: string
}