import { Composer } from "grammy";
import { logger } from "../utils";
import { userDidChangeStatus } from "../private-chat-controller";

const chat = new Composer()

chat.on('my_chat_member', async (ctx, next) => {
    logger.debug('Recieved my_chat_member update', { user: ctx.from.id })
    const status = ctx.myChatMember.new_chat_member.status
    await userDidChangeStatus(ctx.from.id, status)
})

export default chat