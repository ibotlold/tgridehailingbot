import Driver from "../dao/driver/driver"
import User from "../dao/user/user";
import { collections } from "../database";
import { logger } from "../logger";

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

export async function getDriver(userId:number):Promise<Driver> {
  const driver = await collections.drivers!.finByUserId(userId)
  if (!driver) {
    throw new Error('Driver does not exist')
  }
  return driver
}

export async function deleteDriver(userId:number) {
  const driver = new Driver(userId)
  await collections.drivers?.delete(driver)
}

export async function saveDriver(driver:Driver) {
  await collections.drivers?.insert(driver)
}