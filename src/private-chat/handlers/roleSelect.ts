import { Composer, Context, InlineKeyboard } from "grammy";
import { findDriver } from "../driver-controller";
import { Roles } from "../private-chat-controller";
import { supportInlineButton } from "../utils";
import { changeState, States } from "./routers/main-router";

const chat = new Composer()

const roleHandler = new Composer()
roleHandler.callbackQuery(Roles.Driver, async ctx => {
    if (await isDriver(ctx)) {
      await ctx.editMessageText('Водитель\nПолучить новые заказы /refresh', {
        reply_markup: new InlineKeyboard().row(supportInlineButton)
      })
      await changeState(ctx, States.driver)
    } else {
      await ctx.editMessageText('Введите марку авто:', {
        reply_markup: new InlineKeyboard().text('Отменить регистрацию','cancel')
      })
      await changeState(ctx, States.registration)
    }
    await ctx.answerCallbackQuery()
})
roleHandler.callbackQuery(Roles.Passanger, async ctx => {
    await ctx.editMessageText('Пассажир', {
        reply_markup: new InlineKeyboard().text('Сделать заказ', States.request)
        .row(supportInlineButton)
    })
    await ctx.answerCallbackQuery()
    await changeState(ctx, States.passanger)
})

chat.on('callback_query:data', roleHandler)

async function isDriver(ctx:Context):Promise<boolean> {
  if (await findDriver(ctx.from!.id)) {
    return true
  }
  return false
}


export default chat