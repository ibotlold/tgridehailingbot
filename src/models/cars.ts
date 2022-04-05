import { ObjectId } from "mongodb";

export default interface CarModel {
    _id?:ObjectId
    description:string
}