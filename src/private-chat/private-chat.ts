import { Composer } from "grammy";
import { Router } from "@grammyjs/router";
import { getState, States } from "./private-chat-controller";

import errorReply from './handlers/error-reply'
import users from './handlers/users'
import start from './handlers/start'
import roleSelect from "./handlers/role-select";


const chat = new Composer()
chat.use(users)
chat.use(start)
const router = new Router(async ctx => {
    if (!ctx.from?.id) {
        return undefined
    }
    return getState(ctx.from.id)
})
router.route(States.Start, roleSelect)
chat.use(router)
chat.use(errorReply)

export default chat
