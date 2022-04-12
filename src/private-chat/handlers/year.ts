import { Composer } from "grammy"
import { States } from "../../dao/user/user-entity"
import { collections } from "../../database"
import { cancelKeyboard,
  deleteDriver,
  getMainMessageId,
  setMainMessage } from "../utils"
import { Questions } from "./driver"
import { changeState, stateRouter } from "./routers/main-router"

const chat = new Composer()
chat.on('message:text', async (ctx, next) => {
  const driver = await collections.drivers!.finByUserId(ctx.from!.id)
  driver.year = ctx.message.text
  await collections.drivers!.update(driver, driver)
  await changeState(ctx, States.color)
  const message = await ctx.reply(Questions.color, {
    reply_markup: cancelKeyboard(States.start)
  })
  const mainMessageId = await getMainMessageId(ctx)
  await ctx.api.editMessageText(
    ctx.chat!.id, mainMessageId, Questions.year
  )
  await setMainMessage(ctx, message)
})

chat.callbackQuery(States.start, async (ctx, next) => {
  await deleteDriver(ctx)
  await changeState(ctx, States.start)
  await next()
}).use(stateRouter)

export default chat