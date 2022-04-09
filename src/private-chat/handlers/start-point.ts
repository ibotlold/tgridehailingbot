import { Composer } from "grammy"
import { States } from "../../dao/user/user-entity"
import { cancelRequestMarkup } from "../utils"
import { changeState, stateRouter } from "./routers/main-router"

const chat = new Composer()
chat.callbackQuery(States.startPoint, async (ctx) => {
  await ctx.editMessageText('Откуда вас забрать?', {
    reply_markup: cancelRequestMarkup
  })
})

chat.callbackQuery(States.passanger,async (ctx, next) => {
  await changeState(ctx, States.passanger)
  await next()
}).use(stateRouter)

chat.on('msg:text',async (ctx, next) => {
  //save Event to database
  //invoke transition to next stage
})

export default chat