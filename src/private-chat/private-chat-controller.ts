import { collections } from "../database";
import { logger } from "./utils";
import UserModel from "../models/user";

export async function userDidChangedStatus(userId:number, status: string):Promise<void> {
    const user:UserModel = { userId: userId, status: status }
    const userFromDB = await findUserById(userId)
    if (!userFromDB) {
        await collections.users?.insertOne(user)
        return
    }
    await collections.users?.updateOne(userFromDB, {
        $set: { status: user.status}
    })
    logger.info('Updated user status', { user: user })
}

export async function setMainMessage(userId:number, message_id:number):Promise<void> {
    const user = await findUserById(userId)
    await collections.users?.updateOne(user, {
        $set: {
            mainMessage: message_id
        }
    })
    logger.verbose('Main message updated', { user: userId, message_id: message_id })
}

async function findUserById(userId:number):Promise<UserModel> {
    const userFromDB = await collections.users?.findOne({
        userId: userId
    })
    if (!userFromDB) throw new Error('User not found')
    return userFromDB
}