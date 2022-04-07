import { Composer } from "grammy"
import { stateRouter } from "./handlers/routers/main-router"
import errorReply from './handlers/error-reply'
import user from './handlers/middlewares/user'
import start from './handlers/start'
import { ChatControllerInit } from "./private-chat-controller"

const chat = new Composer()
ChatControllerInit().then(() => {
  chat.on('my_chat_member:from', user)
  chat.command('start', start)
  chat.use(stateRouter)
  chat.use(errorReply)
})
export default chat
