import { Composer, InlineKeyboard } from "grammy";
import { States } from "../../dao/user/user-entity";
import { deleteMainMessage, logger, setMainMessage } from "../utils";
import { supportInlineButton } from "../utils";
import { changeState } from "./routers/main-router";

const chat = new Composer()
chat.on('callback_query', async ctx => {
  logger.verbose('User clicked wrong callback keyboard')
  logger.debug(JSON.stringify({
    user: ctx.from.id,
    callback: ctx.callbackQuery.data
  }))
  await ctx.editMessageText('Воспользуйтесь /start', {
    reply_markup: new InlineKeyboard().row(supportInlineButton)
  })
  await ctx.answerCallbackQuery('Ошибка')
})

chat.use(async (ctx,next) => {
  await changeState(ctx, States.start)
  await next()
})
.use(async ctx => {
  logger.verbose('User in dead end', { update: ctx.update } )
  const message = await ctx.reply('Воспользуйтесь /start', {
    reply_markup: new InlineKeyboard().row(supportInlineButton)
  })
  await ctx.deleteMessage()
  await deleteMainMessage(ctx)
  await setMainMessage(ctx,message)
})

export default chat