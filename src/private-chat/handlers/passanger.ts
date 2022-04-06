import { Composer, InlineKeyboard } from "grammy"
import { Roles } from "../private-chat-controller"
import { supportInlineButton } from "../utils"
import { changeState, States } from "./routers/main-router"

const chat = new Composer()
chat.callbackQuery(Roles.Passanger, async ctx => {
  await ctx.editMessageText('Пассажир', {
    reply_markup: new InlineKeyboard().text('Сделать заказ', States.request)
    .row(supportInlineButton)
  })
  await ctx.answerCallbackQuery()
  await changeState(ctx, States.passanger)
})

export default chat