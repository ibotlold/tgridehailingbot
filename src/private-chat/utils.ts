import { Context, GrammyError } from "grammy";
import { InlineKeyboardButton, Message } from "grammy/out/platform.node";
import { Config } from "../config";
import { userDidChangeStatus } from "./private-chat-controller"

import { logger as parentLogger } from "../logger";
import { collections } from "../database";
export const logger = parentLogger.child({
    chatType: 'private'
})

export const supportInlineButton:InlineKeyboardButton = {
    text: 'Поддержка',
    url: Config.SUPPORT_URL()
}

type ChatAction = "typing" | "upload_photo" | "record_video" | "upload_video" | "record_voice" | "upload_voice" | "upload_document" | "find_location" | "record_video_note" | "upload_video_note"
/**
* Check user blocked bot or not
*/
export async function replyWithChatAction(
    ctx:Context,
    action: ChatAction
    ):Promise<void> {
    try {
        await ctx.replyWithChatAction(action)
    } catch(error) {
        if (error instanceof GrammyError) {
            if (error.error_code === 403) {
                await userDidChangeStatus(ctx.from!.id, 'kicked')
            } 
        }            
    }
}

export async function setMainMessage(
    ctx: Context,
    message:Message.TextMessage
    ):Promise<void> {
    const user = await collections.users!.finByUserId(ctx.from!.id)
    logger.debug('Updating main message')
    await collections.users!.update(user!, {
        mainMessage: message.message_id
    })
}

export async function deleteMainMessage(ctx: Context) {
    const user = await collections.users!.finByUserId(ctx.from!.id)
    if (!user!.mainMessage) {
        return
    }
    try {
        await ctx.api.deleteMessage(user!.userId, user!.mainMessage)
    } catch(error) {
        //No-action because message probably old
        logger.verbose('Could not delete main message')
    }
}

export async function isCallbackFromMainMessage(ctx:Context):Promise<boolean> {
    if (!ctx.callbackQuery) throw new Error('')
    if (ctx.callbackQuery.message) {
        const user = await collections.users!.finByUserId(ctx.from!.id)
        if (ctx.callbackQuery.message.message_id === user?.mainMessage) {
            return true
        }
        return false
    }
    return false
}