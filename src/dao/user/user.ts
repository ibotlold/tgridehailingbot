import UserEntity, { States } from "./user-entity";

export default class User implements UserEntity {
  userId: number
  status: string
  mainMessage?: number
  state?: States
  constructor(userId: number, status: string) {
    this.userId = userId
    this.status = status
  }
}