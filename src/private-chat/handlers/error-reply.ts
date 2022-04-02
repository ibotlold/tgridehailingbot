import { Composer, InlineKeyboard } from "grammy";
import { InlineKeyboardButton } from "grammy/out/platform.node";
import { Config } from "../../config";
import { logger } from "../../logger";

const chat = new Composer()
chat.on('callback_query', ctx => {
    logger.verbose('User clicked wrong callback keyboard')
    ctx.answerCallbackQuery('Ошибка')
    ctx.editMessageText('Воспользуйтесь /start', {
        reply_markup: new InlineKeyboard().row(supportInlineButton())
    })
})
chat.use(async ctx => {
    logger.verbose('User in dead end', { update: ctx.update } )
    ctx.reply('Воспользуйтесь /start', {
        reply_markup: new InlineKeyboard().row(supportInlineButton())
    })
})
export default chat

function supportInlineButton():InlineKeyboardButton {
    return { text: 'Поддержка', url: Config.SUPPORT_URL() }
}