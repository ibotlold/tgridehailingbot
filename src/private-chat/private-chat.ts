import { Router } from "@grammyjs/router"
import { Composer } from "grammy"
import mainRouter, { States } from "./handlers/routers/main-router"
import errorReply from './handlers/error-reply'
import user from './handlers/middlewares/user'
import start from './handlers/start'
import roleSelect from './handlers/roleSelect'

const router = new Router(mainRouter)
router.route(States.roleSelect, roleSelect)

const chat = new Composer()
chat.on('my_chat_member:from', user)
chat.command('start', start)
chat.use(router)
chat.use(errorReply)

export default chat
