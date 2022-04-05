import { ObjectId } from 'mongodb'

export default interface UserModel {
    _id?: ObjectId
    role?: string
    userId: number,
    status: string
}