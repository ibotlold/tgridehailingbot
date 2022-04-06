import { Composer, InlineKeyboard } from "grammy";
import { Roles } from "../private-chat-controller";
import { replyWithChatAction, setMainMessage, supportInlineButton } from "../utils";
import { changeState, States } from "./routers/main-router";

const chat = new Composer()
chat.command('start', async ctx => {
    await replyWithChatAction(ctx,'typing')
    const message = await ctx.reply('Выберите роль:', {
        reply_markup: new InlineKeyboard()
        .text('Пассажир', Roles.Passanger)
        .text('Водитель', Roles.Driver)
        .row(supportInlineButton)
    })
    await setMainMessage(ctx, message)
    await changeState(ctx, States.start)
})
chat.callbackQuery(Roles.Passanger, async(ctx,next) => {
    await changeState(ctx, States.passanger)
    await next()
})
chat.callbackQuery(Roles.Driver, async (ctx,next) => {
    await changeState(ctx, States.driver)
    await next()
})


export default chat