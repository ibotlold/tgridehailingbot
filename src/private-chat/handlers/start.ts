import { Composer } from "grammy";
import { States } from "../../dao/user/user-entity";
import { Roles } from "../private-chat-controller";
import start from './middlewares/start'
import { changeState, stateRouter } from "./routers/main-router";

const chat = new Composer()
chat.command('start', start)
chat.callbackQuery(States.start, start)

chat.callbackQuery(Roles.Passanger, async(ctx,next) => {
  await changeState(ctx, States.passanger)
  await next()
}).use(stateRouter)

chat.callbackQuery(Roles.Driver, async (ctx,next) => {
  await changeState(ctx, States.driver)
  await next()
}).use(stateRouter)

export default chat