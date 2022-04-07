import { ObjectId } from "mongodb"
import User from "./user"

export default interface UserDAO {
  insertUser(user: User):Promise<void>
  deleteUser(user: User):Promise<void>
  findUserById(userId: number):Promise<User>
  updateUser(user: User, updates: Partial<User>):Promise<void>
}