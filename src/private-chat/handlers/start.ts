import { Composer, InlineKeyboard } from "grammy";
import { Roles } from "../private-chat-controller";
import { deleteMainMessage, replyWithChatAction, setMainMessage, supportInlineButton } from "../utils";
import { changeState, stateRouter, States } from "./routers/main-router";

const chat = new Composer()
chat.command('start', async ctx => {
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
})
chat.callbackQuery(Roles.Passanger, async(ctx,next) => {
    await changeState(ctx, States.passanger)
    await next()
}).use(stateRouter)
chat.callbackQuery(Roles.Driver, async (ctx,next) => {
    await changeState(ctx, States.driver)
    await next()
}).use(stateRouter)

export default chat