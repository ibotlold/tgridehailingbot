import { Context, GrammyError } from "grammy";
import { InlineKeyboardButton, Message } from "grammy/out/platform.node";
import { Config } from "../config";
import { getMainMessage, setMainMessage as saveMainMessage, userDidChangedStatus } from "./private-chat-controller"

import { logger as parentLogger } from "../logger";
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
                await userDidChangedStatus(ctx.from!.id, 'kicked')
            } 
        }            
    }
}

export async function setMainMessage(
    ctx: Context,
    message:Message.TextMessage
    ):Promise<void> {
    await saveMainMessage(ctx.from!.id, message.message_id)
}

export async function deleteMainMessage(ctx: Context) {
    const mainMessageId = await getMainMessage(ctx.from!.id)
    if (!mainMessageId) {
        return
    }
    try {
        await ctx.api.deleteMessage(ctx.chat!.id, mainMessageId)
    } catch(error) {
        //No-action because message probably old
        logger.verbose('Could not delete main message')
    }
}

export async function isMainMessage(ctx:Context):Promise<boolean> {
    if (ctx.callbackQuery?.message) {
        if (ctx.callbackQuery.message.message_id === await getMainMessage(ctx.from!.id)) {
            return true
        }
        return false
    }
    return true
}