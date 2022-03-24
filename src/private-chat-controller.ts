import { User as TgUser } from "grammy/out/platform.node";
import User from './models/user'
import { logger } from "./logger";
import { collections } from "./database";

enum MemberStatus {
    kicked = 'kicked',
    member = 'member'
}

async function saveNewUser(user:User) {
    try {
        await collections.users?.insertOne(user)
        logger.debug('Inserted new user', { user: user })
    } catch(e) {
        logger.error(JSON.stringify(e))
    }
}
async function deleteUser(user:User) {
    const query = { userId: user.userId }
        try {
            await collections.users?.deleteOne(query)
            logger.debug('Deleted user', { user: user } )
        } catch(e) {
            logger.error(JSON.stringify(e))
        }
}

export async function userChangedRole(tgUser: TgUser, role:string) {
    if (collections.users) {
        await collections.users.updateOne({ userId: tgUser.id }, { $set: { role: role }})
    }
}

export async function memberStatusChanged(tgUser: TgUser, newStatus: string) {
    const user = new User(tgUser.id, newStatus)
    if (newStatus == MemberStatus.member) {
        await saveNewUser(user)
    }
    if (newStatus == MemberStatus.kicked) {
        await deleteUser(user)
    }
}