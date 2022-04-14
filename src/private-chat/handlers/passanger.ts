import { Composer, InlineKeyboard } from "grammy"
import { States } from "../../dao/user/user-entity"
import { Roles } from "../private-chat-controller"
import { supportInlineButton } from "../utils"
import { changeState, stateRouter } from "./routers/main-router"

export enum Questions {
  startPoint = 'Откуда вас забрать?',
  endPoint = 'Куда хотите приехать?',
  note = 'Что еще необходимо знать водителю?',
  price = 'Сколько будете платить?',
  method = 'Чем будете платить?'
}

const chat = new Composer()
chat.callbackQuery(Roles.Passanger, async ctx => {
  await ctx.editMessageText('Пассажир', {
    reply_markup: new InlineKeyboard().text('Сделать заказ', States.startPoint)
    .row(supportInlineButton)
  })
  await ctx.answerCallbackQuery()
  await changeState(ctx, States.passanger)
})

chat.callbackQuery(States.startPoint,async (ctx, next) => {
  await changeState(ctx, States.startPoint)
  await next()
}).use(stateRouter)

export default chat