import { Composer } from "grammy"
import Driver from "../../dao/driver/driver"
import { States } from "../../dao/user/user-entity"
import { saveDriver } from "../private-chat-controller"
import { cancelKeyboard, deleteDriver } from "../utils"
import { changeState, stateRouter } from "./routers/main-router"

const chat = new Composer()
chat.callbackQuery(States.driver, async ctx => {
  await ctx.editMessageText('Необходимо зарегистрироваться\n\nВведите марку авто:', {
    reply_markup: cancelKeyboard(States.start)
  })
})

chat.on('message:text', async (ctx, next) => {
  const driver = new Driver(ctx.from.id)
  driver.brand = ctx.message.text
  saveDriver(driver)
  await changeState(ctx, States.model)
  await next()
}).use(stateRouter)

chat.callbackQuery(States.start, async (ctx, next) => {
  await deleteDriver(ctx)
  await changeState(ctx, States.start)
  await next()
}).use(stateRouter)

export default chat