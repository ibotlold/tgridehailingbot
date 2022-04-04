import { InlineKeyboardButton } from "grammy/out/platform.node";
import { Config } from "../config";

export const supportInlineButton:InlineKeyboardButton = { text: 'Поддержка', url: Config.SUPPORT_URL() }