import mongoDAO from "./abstract-dao";
import User from "../dao/user/user";
import UserEntity from "../dao/user/user-entity";
import { logger } from "../logger";
import DataAccessObject from "../dao/dao";

export default class mongoUserDAO 
extends mongoDAO<UserEntity> implements DataAccessObject<User> {
  async insertUser(user: User):Promise<void> {
    await this._collection.insertOne({
      userId: user.userId,
      status: user.status
    })
    logger.debug('New user created')
  }
  async deleteUser(user: User):Promise<void> {
    await this._collection.findOneAndDelete({
      userId: user.userId
    })
    logger.debug('User deleted')
  }
  async findUserById(userId: number):Promise<User> {
    const user = await this._collection.findOne({
      userId: userId
    })
    if (!user) throw new Error('User does not exist')
    logger.debug('User found')
    return user
  }
  async  updateUser(user: User, updates: Partial<User>):Promise<void> {
    const result = await this._collection.findOneAndUpdate({
      userId: user.userId
    }, {
        $set: updates
      }
    )
    logger.debug('User updated', result)
  }
}