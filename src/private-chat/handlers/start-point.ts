import { Composer } from "grammy"
import Request from "../../dao/request/request"
import { States } from "../../dao/user/user-entity"
import { collections } from "../../database"
import { cancelKeyboard, getMainMessageId, setMainMessage } from "../utils"
import { Questions } from "./passanger"
import { changeState, stateRouter } from "./routers/main-router"

const chat = new Composer()
chat.callbackQuery(States.startPoint, async (ctx) => {
  await ctx.editMessageText(Questions.startPoint, {
    reply_markup: cancelKeyboard(States.passanger)
  })
})

chat.callbackQuery(States.passanger, async (ctx, next) => {
  await changeState(ctx, States.passanger)
  await next()
}).use(stateRouter)

chat.on('message:text',async (ctx, next) => {
  const request = new Request(ctx.from!.id)
  request.startPoint = ctx.message.text
  await collections.requests!.insert(request)
  await changeState(ctx, States.endPoint)
  const message = await ctx.reply(Questions.endPoint, {
    reply_markup: cancelKeyboard(States.passanger)
  })
  const mainMessageId = await getMainMessageId(ctx)
  await ctx.api.editMessageText(
    ctx.chat.id, mainMessageId, Questions.startPoint
    )
  await setMainMessage(ctx, message)
})

export default chat