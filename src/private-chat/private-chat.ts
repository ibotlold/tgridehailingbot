import { Composer } from "grammy";
import { logger as parentLogger } from "../logger";
import errorReply from './handlers/error-reply'
import start from './handlers/start'

export const logger = parentLogger.child({
    chatType: 'private'
})

const chat = new Composer()
chat.use(start)
chat.use(errorReply)

export default chat
