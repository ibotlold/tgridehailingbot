import { Context, NextFunction } from "grammy";
import { userDidChangeStatus } from "../../private-chat-controller";
import { logger } from "../../utils";

export default async function user(ctx: Context, next: NextFunction)
:Promise<void> {
  const newStatus = ctx.update.my_chat_member!.new_chat_member.status
  logger.info('Changed status', { 
    user: { 
      userId: ctx.from!.id,
      status: newStatus
    }
  })
  await userDidChangeStatus(ctx.from!.id, newStatus)
}