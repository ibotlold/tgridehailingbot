import mongoDAO from "./abstract-dao";
import UserDAO from "../dao/user/user-dao";
import User from "../dao/user/user";
import UserEntity from "../dao/user/user-entity";
import { logger } from "../logger";

export default class mongoUserDAO 
extends mongoDAO<UserEntity> implements UserDAO {
  async insertUser(user: User):Promise<void> {
    await this._collection.insertOne({
      userId: user.userId,
      status: user.status
    })
  }
  async deleteUser(user: User):Promise<void> {
    this._collection.findOneAndDelete({
      userId: user.userId
    })
  }
  async findUserById(userId: number):Promise<User> {
    const user = await this._collection.findOne({
      userId: userId
    })
    if (!user) throw new Error('User does not exist')
    return user
  }
  async  updateUser(user: User, updates: Partial<User>):Promise<void> {
    const result = await this._collection.findOneAndUpdate({
      userId: user.userId
    }, {
        $set: {
          status: updates.status,
          mainMessage: user.mainMessage,
          state: user.state
        }
      }
    )
    logger.debug('Update user', result)
  }
}