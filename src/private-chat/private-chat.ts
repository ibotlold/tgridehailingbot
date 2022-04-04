import { Composer } from "grammy";

import start from './handlers/start'
import users from './handlers/users'
import errorReply from './handlers/error-reply'


const chat = new Composer()
chat.use(users)
chat.use(start)
chat.use(errorReply)

export default chat
