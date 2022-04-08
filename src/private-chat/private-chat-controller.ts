import User from "../dao/user/user";
import { collections } from "../database";
import { logger } from "../logger";
import mongoDAO from "../mongo/dao-impl";

export enum Roles {
    Passanger = 'passanger',
    Driver = 'driver'
}
//#region DAO objects
export const dao:{
    userDAO?: mongoDAO<User>
} = {}

export async function ChatControllerInit() {
    dao.userDAO = new mongoDAO(collections.users!)
}
//#endregion

export async function userDidChangeStatus(userId:number, newStatus: string)
:Promise<void> {
    const user = new User(userId, newStatus)
    const userFromDB = await dao.userDAO?.finByUserId(user.userId)
    if (userFromDB) {
        logger.debug('Updating user status')
        await dao.userDAO?.update(userFromDB, user)
        return
    }
    logger.debug('Creating new user')
    dao.userDAO?.insert(user)
}