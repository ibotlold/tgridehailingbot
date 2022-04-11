import { Composer } from "grammy"
import { States } from "../../dao/user/user-entity"
import { isUserRegisteredAsDriver } from "../utils"
import { changeState, stateRouter } from "./routers/main-router"

const chat = new Composer()

//Check is driver registered
chat.callbackQuery(States.driver, async (ctx, next) => {
  const checkResult = await isUserRegisteredAsDriver(ctx)
  if (!checkResult) {
    await changeState(ctx, States.registration)
    await next()
  }
}).use(stateRouter)
chat.callbackQuery(States.driver, async ctx => {
  throw new Error('TODO')
})

export default chat