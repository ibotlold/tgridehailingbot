import { Composer } from "grammy";
import { logger as parentLogger } from "../logger";
import errorReply from './handlers/error-reply'

const logger = parentLogger.child({
    chatType: 'private'
})

const chat = new Composer()
chat.use(errorReply)

export default chat
