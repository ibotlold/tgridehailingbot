import { InlineKeyboardButton } from "grammy/out/platform.node";
import { Config } from "../config";

import { logger as parentLogger } from "../logger";
export const logger = parentLogger.child({
    chatType: 'private'
})

export const supportInlineButton:InlineKeyboardButton = { text: 'Поддержка', url: Config.SUPPORT_URL() }