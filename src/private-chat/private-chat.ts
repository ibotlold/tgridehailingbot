import { Router } from "@grammyjs/router"
import { Composer } from "grammy"
import mainRouter, { States } from "./handlers/routers/main-router"
import errorReply from './handlers/error-reply'
import user from './handlers/middlewares/user'
import start from './handlers/start'

export const router = new Router(mainRouter)
router.route(States.start, start)

const chat = new Composer()
chat.on('my_chat_member:from', user)
chat.command('start', start)
//Double use(route) because of hande transition to new state
chat.use(router).use(router)
chat.use(errorReply)
export default chat
