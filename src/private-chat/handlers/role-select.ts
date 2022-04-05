import { Composer, InlineKeyboard } from "grammy";
import { Roles } from "../../app";
import { findUserById, isMainMessage, userDidSelectedRole } from "../private-chat-controller";
import { logger, supportInlineButton } from "../utils";

const chat = new Composer()

chat.on('callback_query:data').filter(async ctx => {
    let message_id = ctx.callbackQuery.message?.message_id
    if (message_id) {
        return await isMainMessage(ctx.from.id, message_id)
    }
    return false
}, async (ctx,next) => {
    let role: string
    if (ctx.callbackQuery.data === Roles.DRIVER) {
        role = 'Водитель'
    } else {
        role = 'Пассажир'
    }
    try {
        await ctx.editMessageText(role, {
            reply_markup: new InlineKeyboard().row(supportInlineButton)
        })
        await ctx.answerCallbackQuery()
    } catch(error) {
        logger.verbose('Error on editing message', { error })
        await next()
    }

    await userDidSelectedRole(ctx.from.id, ctx.callbackQuery.data as Roles)
    logger.debug('User selected role',{ user: { userId: ctx.from.id, role: ctx.callbackQuery.data } })
})

export default chat