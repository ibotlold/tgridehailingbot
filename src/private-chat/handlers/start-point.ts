import { Composer, InlineKeyboard } from "grammy"
import { InlineKeyboardButton } from "grammy/out/platform.node"
import { States } from "../../dao/user/user-entity"
import { cancelRequest } from "../utils"
import { changeState, stateRouter } from "./routers/main-router"

const chat = new Composer()
chat.callbackQuery(States.startPoint, async (ctx) => {
  await ctx.editMessageText('Введите начальный адрес', {
    reply_markup: new InlineKeyboard().row(cancelRequest)
  })
})

chat.callbackQuery(States.passanger,async (ctx, next) => {
  await changeState(ctx, States.passanger)
  await next()
}).use(stateRouter)

export default chat