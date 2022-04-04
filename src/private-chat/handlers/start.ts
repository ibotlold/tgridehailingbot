import { Composer, InlineKeyboard } from "grammy";
import { Roles } from "../../app";
import { logger } from "../private-chat";
import { supportInlineButton } from "../utils";

const chat = new Composer()

chat.command('start', async ctx => {
    await ctx.replyWithChatAction('typing')
    await ctx.reply('Выберите роль:', {
        reply_markup: new InlineKeyboard()
        .text('Пассажир', Roles.PASSANGER)
        .text('Водитель', Roles.DRIVER)
        .row(supportInlineButton)
    })
})


export default chat