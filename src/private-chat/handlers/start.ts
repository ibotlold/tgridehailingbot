import { Composer, InlineKeyboard } from "grammy";
import { Roles } from "../../app";
import { logger } from "../utils";
import { supportInlineButton } from "../utils";

const chat = new Composer()

chat.command('start', async ctx => {
    logger.debug('Start command')
    await ctx.replyWithChatAction('typing')
    await ctx.reply('Выберите роль:', {
        reply_markup: new InlineKeyboard()
        .text('Пассажир', Roles.PASSANGER)
        .text('Водитель', Roles.DRIVER)
        .row(supportInlineButton)
    })
})


export default chat