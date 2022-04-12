import { Composer } from "grammy"
import Driver from "../../dao/driver/driver"
import { States } from "../../dao/user/user-entity"
import { saveDriver } from "../private-chat-controller"
import { cancelKeyboard,
  deleteDriver,
  getMainMessageId,
  setMainMessage } from "../utils"
import { Questions } from "./driver"
import { changeState, stateRouter } from "./routers/main-router"

const chat = new Composer()
chat.callbackQuery(States.driver, async ctx => {
  await ctx.editMessageText(Questions.registration, {
    reply_markup: cancelKeyboard(States.start)
  })
})

chat.on('message:text', async (ctx, next) => {
  const driver = new Driver(ctx.from.id)
  driver.brand = ctx.message.text
  await saveDriver(driver)
  await changeState(ctx, States.model)
  const message = await ctx.reply(Questions.model, {
    reply_markup: cancelKeyboard(States.start)
  })
  const mainMessageId = await getMainMessageId(ctx)
  await ctx.api.editMessageText(
    ctx.chat!.id, mainMessageId, Questions.registration
  )
  await setMainMessage(ctx, message)
})

chat.callbackQuery(States.start, async (ctx, next) => {
  await deleteDriver(ctx)
  await changeState(ctx, States.start)
  await next()
}).use(stateRouter)

export default chat