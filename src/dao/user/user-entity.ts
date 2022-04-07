import { ObjectId } from "mongodb"
import { States } from "../../private-chat/handlers/routers/main-router"

export default interface UserEntity {
  _id?: ObjectId
  userId: number
  status: string
  mainMessage?: number
  state?: States
}