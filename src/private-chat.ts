import { Router } from "@grammyjs/router";
import { Composer, InlineKeyboard } from "grammy";
import { logger as parentLogger } from "./logger";
import passangerChat from "./passanger-chat"
import driverChat from "./driver-chat"
import * as privateChatController from "./private-chat-controller"

const logger = parentLogger.child({
    chatType: 'private'
})

export enum UserRoles {
    PASSANGER = 'PASSANGER',
    DRIVER    = 'DRIVER'
}

const router = new Router(ctx => {
    switch (ctx.update.callback_query?.data) {
        case 'PASSANGER':
            return 'passanger'
            break
        case 'DRIVER':
            return 'driver'
            break
        default:
            return undefined
            break
    }
})

router.route('passanger', passangerChat)
router.route('driver', driverChat)

const chat = new Composer()
chat.on('my_chat_member', async (ctx) => {
    const newStatus:string = ctx.update.my_chat_member.new_chat_member.status
    logger.info(`Bot chat status changed to ${newStatus}`)
    logger.debug(JSON.stringify(ctx.update, null, '  '))
    await privateChatController.memberStatusChanged(ctx.from, newStatus)
})
chat.command('start', async (ctx) => {
    logger.debug('Bot recieved command start')
    await ctx.replyWithChatAction('typing')
    await ctx.reply('Кем вы хотите быть?', { 
        reply_markup: new InlineKeyboard().text('Пассажиром','PASSANGER')
                                          .text('Водителем','DRIVER')
    })
})
chat.command('status',async (ctx) => {
    ctx.reply('TODO')
})
chat.on('callback_query',async (ctx, next) => {
    const data = ctx.callbackQuery.data ?? ''
    if (Object.values<string>(UserRoles).includes(data)) {
        try {
            await privateChatController.userChangedRole(ctx.from, data)
        } catch(e) {
            logger.error('Error trying to set role to user')
            logger.debug(JSON.stringify(ctx.update, null, '  '))
        }
        if (data == UserRoles.PASSANGER) {
            await ctx.answerCallbackQuery('Вы пассажир')
        }
        if (data == UserRoles.DRIVER) {
            await ctx.answerCallbackQuery('Вы водитель')
        }
        await ctx.editMessageReplyMarkup()
    }
    next()
})

export default chat
