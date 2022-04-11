import { Context, InlineKeyboard, NextFunction } from "grammy"
import { States } from "../../../dao/user/user-entity"
import { Roles } from "../../private-chat-controller"
import { deleteMainMessage, replyWithChatAction, setMainMessage, supportInlineButton } from "../../utils"
import { changeState } from "../routers/main-router"

export default async (ctx:Context) => {
  await replyWithChatAction(ctx,'typing')
  const promiseDeleteMainMessage = deleteMainMessage(ctx)
  const message = await ctx.reply('Выберите роль:', {
    reply_markup: new InlineKeyboard()
    .text('Пассажир', Roles.Passanger)
    .text('Водитель', Roles.Driver)
    .row(supportInlineButton)
  })
  const promiseDeleteMessage = ctx.deleteMessage()
  await Promise.all([promiseDeleteMainMessage, promiseDeleteMessage])
  await setMainMessage(ctx, message)
  await changeState(ctx, States.start)
}