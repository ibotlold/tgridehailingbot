import { Composer } from "grammy";

const chat = new Composer()
chat.on('callback_query', async ctx => {
    await ctx.answerCallbackQuery('Вы пассажир')
    await ctx.editMessageReplyMarkup()
    await ctx.reply('Создать заказ /request\nСменить роль /start')
})


export default chat