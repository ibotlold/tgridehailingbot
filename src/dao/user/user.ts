import { ObjectId } from "mongodb";
import { States } from "../../private-chat/handlers/routers/main-router";
import UserEntity from "./user-entity";

export default class User implements UserEntity {
  _id?: ObjectId
  userId: number
  status: string
  mainMessage?: number
  state?: States
  private constructor(userId: number, status: string) {
    this.userId = userId
    this.status = status
  }
}