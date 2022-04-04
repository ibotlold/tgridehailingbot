import { Composer, InlineKeyboard } from "grammy";
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
    ctx.reply('Воспользуйтесь /start', {
        reply_markup: new InlineKeyboard().row(supportInlineButton)
    })
})
export default chat