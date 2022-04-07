import { collections } from "../database";
import { logger } from "../logger";
import mongoUserDAO from "../mongo/user-dao-impl";
import { States } from "./handlers/routers/main-router";

export enum Roles {
    Passanger = 'passanger',
    Driver = 'driver'
}

export const dao:{
    userDAO?: mongoUserDAO
} = {}

export async function ChatControllerInit() {
    dao.userDAO = new mongoUserDAO(collections.users!)
}

export async function userDidChangedStatus(userId:number, newStatus: string):Promise<void> {
    const userFromDB = await collections.users?.findOne({
        userId: userId
    })
    if (!userFromDB) {
        await collections.users!.insertOne({
            userId: userId,
            status: newStatus
        })
        logger.debug('Created new user', { user: { userId: userId, status: newStatus } })
        return
    }
    await collections.users?.updateOne(userFromDB, {
        $set: { status: newStatus }
    })
    logger.debug('Updated user status', { user: userFromDB })
}

export async function setMainMessage(userId:number, messageId: number):Promise<void> {
    const user = await collections.users!.findOne({
        userId: userId
    })
    await collections.users!.updateOne(user!, {
        $set: {
            mainMessage: messageId
        }
    })
}

export async function getMainMessage(userId:number) {
    const user = await collections.users!.findOne({
        userId: userId
    })
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