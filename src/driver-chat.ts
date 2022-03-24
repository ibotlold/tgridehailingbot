import { Composer } from "grammy";

const chat = new Composer()
chat.on('callback_query', async ctx => {
    await ctx.answerCallbackQuery('Вы водитель')
    await ctx.editMessageReplyMarkup()
    await ctx.reply('Получить новые заказы /refresh\nСменить роль /start')
})


export default chat