import { Composer } from "grammy";
import { logger } from "../private-chat";
import { userDidChangedStatus } from "../private-chat-controller";

const chat = new Composer()

chat.on('my_chat_member', async (ctx, next) => {
    const status = ctx.myChatMember.new_chat_member.status
    await userDidChangedStatus(ctx.from.id, status)
})

export default chat