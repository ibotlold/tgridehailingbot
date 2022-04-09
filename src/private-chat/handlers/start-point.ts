import { Composer } from "grammy"
import { States } from "../../dao/user/user-entity"

const chat = new Composer()
chat.callbackQuery(States.startPoint, async (ctx) => {
  await ctx.editMessageText('Введите начальный адрес')
  
})

export default chat