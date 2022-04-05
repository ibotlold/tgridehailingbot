import { Composer, InlineKeyboard } from "grammy";
import { userDidStarted } from "../private-chat-controller";
import { logger } from "../utils";
import { supportInlineButton } from "../utils";


const chat = new Composer()
chat.on('callback_query', ctx => {
    logger.verbose('User clicked wrong callback keyboard')
    logger.debug(JSON.stringify({
        user: ctx.from.id,
        callback: ctx.callbackQuery.data
    }))
    ctx.answerCallbackQuery('Ошибка')
    ctx.editMessageText('Воспользуйтесь /start', {
        reply_markup: new InlineKeyboard().row(supportInlineButton)
    })
})
chat.use(async ctx => {
    logger.verbose('User in dead end', { update: ctx.update } )
    const message = await ctx.reply('Воспользуйтесь /start', {
        reply_markup: new InlineKeyboard().row(supportInlineButton)
    })
    await userDidStarted(ctx.from!.id, message.message_id)
})
export default chat