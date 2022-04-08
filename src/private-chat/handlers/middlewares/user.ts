import { Context, NextFunction } from "grammy";
import User from "../../../dao/user/user";
import { dao } from "../../private-chat-controller";
import { logger } from "../../utils";

export default async function user(
    ctx: Context,
    next: NextFunction
):Promise<void> {
    const newStatus = ctx.update.my_chat_member!.new_chat_member.status
    logger.info('Changed status', { 
        user: { 
            userId: ctx.from!.id,
            status: newStatus
        }
    })
    const user = new User(ctx.from!.id, newStatus)
    const userFromDB = await dao.userDAO?.findUserById(user.userId)
    if (userFromDB) {
        await dao.userDAO?.updateUser(userFromDB, user)
        return
    }
    dao.userDAO?.insertUser(user)
}