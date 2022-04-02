import { Composer } from "grammy";
import { logger as parentLogger } from "../logger";

const logger = parentLogger.child({
    chatType: 'private'
})

export enum UserRoles {
    PASSANGER = 'PASSANGER',
    DRIVER    = 'DRIVER'
}

const chat = new Composer()
chat.on('my_chat_member', async (ctx) => {
    //todo
})
chat.command('start', async (ctx) => {
    //todo
})
chat.command('status',async (ctx) => {
    //todo
})
chat.on('callback_query',async (ctx, next) => {
    //todo
})

export default chat
