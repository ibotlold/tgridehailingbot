import { collections } from "../database";
import { logger } from "./utils";
import UserModel from "../models/user";

export async function userDidChangedStatus(userId:number, status: string):Promise<void> {
    const user:UserModel = { userId: userId, status: status }
    const userFromDB = await collections.users?.findOne({
        userId: user.userId
    })
    if (!userFromDB) {
        await collections.users?.insertOne(user)
        return
    }
    await collections.users?.updateOne(userFromDB, {
        $set: { status: user.status}
    })
    logger.info('Updated user status', { user: user })
}