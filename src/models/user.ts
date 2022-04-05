import { ObjectId } from 'mongodb'

export default interface UserModel {
    _id?: ObjectId
    userId: number
    status: string
    mainMessage?: number
    role?: string
}