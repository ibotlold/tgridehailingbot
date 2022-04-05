import { Composer, InlineKeyboard } from "grammy";
import { Roles } from "../../app";
import { userDidStarted } from "../private-chat-controller";
import { logger } from "../utils";
import { supportInlineButton } from "../utils";

const chat = new Composer()

chat.command('start', async ctx => {
    logger.debug('Start command')
    await ctx.replyWithChatAction('typing')
    const message = await ctx.reply('Выберите роль:', {
        reply_markup: new InlineKeyboard()
        .text('Пассажир', Roles.PASSANGER)
        .text('Водитель', Roles.DRIVER)
        .row(supportInlineButton)
    })
    await userDidStarted(ctx.from!.id, message.message_id)
})


export default chat