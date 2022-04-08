import User from "../dao/user/user";
import { collections } from "../database";
import { logger } from "../logger";
import mongoUserDAO from "../mongo/user-dao";

export enum Roles {
    Passanger = 'passanger',
    Driver = 'driver'
}
//#region DAO objects
export const dao:{
    userDAO?: mongoUserDAO
} = {}

export async function ChatControllerInit() {
    dao.userDAO = new mongoUserDAO(collections.users!)
}
//#endregion

export async function userDidChangeStatus(userId:number, newStatus: string)
:Promise<void> {
    const user = new User(userId, newStatus)
    const userFromDB = await dao.userDAO?.findUserById(user.userId)
    if (userFromDB) {
        logger.debug('Updating user status')
        await dao.userDAO?.updateUser(userFromDB, user)
        return
    }
    logger.debug('Creating new user')
    dao.userDAO?.insertUser(user)
}