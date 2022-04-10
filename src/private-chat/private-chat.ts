import { Composer } from "grammy"
import { stateRouter } from "./handlers/routers/main-router"
import errorReply from './handlers/error-reply'
import user from './handlers/middlewares/user'
import start from './handlers/start'

const chat = new Composer()
chat.on('my_chat_member:from', user)
chat.command('start', start)
chat.use(stateRouter)
chat.use(errorReply)

export default chat
