import { Composer, InlineKeyboard } from "grammy"
import { collections } from "../../database"
import { markdownv2 as format } from "telegram-format/dist/source"
import { States } from "../../dao/user/user-entity"
import { deleteDriver, setMainMessage } from "../utils"
import { changeState, stateRouter } from "./routers/main-router"

const chat = new Composer()
chat.on('message:text', async (ctx, next) => {
  const driver = await collections.drivers?.finByUserId(ctx.from!.id)
  const vehicleDescription = 
`${driver?.brand}
${driver?.model}
${driver?.year}
${driver?.color}
${driver?.plate}`
  const message = await ctx.reply('Все правильно?\n```\n' +
      format.escape(vehicleDescription) + '```', {
        parse_mode: 'MarkdownV2',
        reply_markup: new InlineKeyboard().text('Да', States.driver).row()
        .text('Отмена', States.start)
  })
  await setMainMessage(ctx, message)
})

chat.callbackQuery(States.driver, async (ctx, next) => {
  await changeState(ctx, States.driver)
  await next()
}).use(stateRouter)

chat.callbackQuery(States.start, async (ctx, next) => {
  await deleteDriver(ctx)
  await changeState(ctx, States.start)
  await next()
}).use(stateRouter)

export default chat