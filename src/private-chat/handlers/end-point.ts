import { Composer } from "grammy"
import Request from "../../dao/request/request"
import { States } from "../../dao/user/user-entity"
import { collections } from "../../database"
import { cancelKeyboard, getMainMessageId, setMainMessage } from "../utils"
import { Questions } from "./passanger"
import { changeState, stateRouter } from "./routers/main-router"

const chat = new Composer()

chat.callbackQuery(States.passanger, async (ctx, next) => {
  await changeState(ctx, States.passanger)
  await next()
}).use(stateRouter)

chat.on('message:text',async (ctx, next) => {
  const request = await collections.requests!.finByUserId(ctx.from!.id)
  request.endPoint = ctx.message.text
  await collections.requests!.insert(request)
  await changeState(ctx, States.note)
  const message = await ctx.reply(Questions.note, {
    reply_markup: cancelKeyboard(States.passanger)
  })
  const mainMessageId = await getMainMessageId(ctx)
  await ctx.api.editMessageText(
    ctx.chat.id, mainMessageId, Questions.endPoint
    )
  await setMainMessage(ctx, message)
})

export default chat