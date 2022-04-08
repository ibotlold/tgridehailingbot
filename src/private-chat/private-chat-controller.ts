import User from "../dao/user/user";
import { collections } from "../database";
import { logger } from "../logger";
import mongoUserDAO from "../mongo/user-dao";
import { States } from "./handlers/routers/main-router";

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

export async function userDidChangeStatus(userId:number, newStatus: string):Promise<void> {
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

export async function setMainMessage(userId:number, messageId: number):Promise<void> {
    const user = await dao.userDAO?.findUserById(userId)
    if (!user) throw new Error('User does not exist')
    logger.debug('Update user main message')
    dao.userDAO?.updateUser(user, { mainMessage: messageId })
}

export async function getMainMessage(userId:number) {
    const user = await dao.userDAO?.findUserById(userId)
    if (!user) throw new Error('User does not exist')
    return user?.mainMessage
}

export async function getUserState(userId:number):Promise<States | undefined> {
    const user = await collections.users!.findOne({
        userId: userId
    })
    logger.debug('Find user state', { user: {userId: userId, state: user!.state } })
    return user!.state
}

export async function setUserState(userId:number, state: States):Promise<void> {
    const user = await collections.users!.findOne({
        userId: userId
    })
    await collections.users!.updateOne(user!,{
        $set: { state: state }
    })
    logger.debug('Update user state', { user: {userId: userId, state: state } })
}