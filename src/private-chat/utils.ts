import { Context, GrammyError, InlineKeyboard } from "grammy";
import { InlineKeyboardButton, Message } from "grammy/out/platform.node";
import { Config } from "../config";
import { getDriver,
  userDidChangeStatus,
  deleteDriver as controllerDeleteDriver,
  getMainMessageId as controllerGetMainMessageId } from "./private-chat-controller"

import { logger as parentLogger } from "../logger";
import { collections } from "../database";
import { States } from "../dao/user/user-entity"

export const logger = parentLogger.child({
  chatType: 'private'
})

export const supportInlineButton:InlineKeyboardButton = {
  text: 'Поддержка',
  url: Config.SUPPORT_URL()
}

export const cancelRequestMarkup = new InlineKeyboard().text(
    'Отмена',
    States.cancelRequest
)

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
  message:Message.TextMessage):Promise<void> 
{
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
  if (ctx.callbackQuery?.message) {
    const user = await collections.users!.finByUserId(ctx.from!.id)
    if (ctx.callbackQuery.message.message_id === user?.mainMessage) {
      return true
    }
    return false
  }
  return true
}

export async function isUserRegisteredAsDriver(ctx:Context):Promise<boolean> {
  try {
    await getDriver(ctx.from!.id)
  } catch(error) {
    //Throws error if driver is not found in database
    return false
  }
  return true
}

export function cancelKeyboard(returnsTo:States):InlineKeyboard {
  return new InlineKeyboard().text('Отмена', returnsTo)
}

export async function deleteDriver(ctx: Context) {
  await controllerDeleteDriver(ctx.from!.id)
}

export async function getMainMessageId(ctx: Context):Promise<number> {
  return await controllerGetMainMessageId(ctx.from!.id)
}