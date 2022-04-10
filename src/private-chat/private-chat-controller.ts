import User from "../dao/user/user";
import { collections } from "../database";
import { logger } from "../logger";
import mongoDAO from "../mongo/dao-impl";

export enum Roles {
  Passanger = 'passanger',
  Driver = 'driver'
}

export async function userDidChangeStatus(userId:number, newStatus: string)
:Promise<void> {
  const user = new User(userId, newStatus)
  const userFromDB = await collections.users!.finByUserId(user.userId)
  if (userFromDB) {
    logger.debug('Updating user status')
    await collections.users!.update(userFromDB, user)
    return
  }
  logger.debug('Creating new user')
  await collections.users!.insert(user)
}