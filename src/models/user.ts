import { ObjectId } from 'mongodb'
import { States } from '../private-chat/private-chat-controller'

export default interface UserModel {
    _id?: ObjectId
    userId: number
    status: string
    mainMessage?: number
    state?: States
    role?: string
}