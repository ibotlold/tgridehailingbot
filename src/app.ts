import { Router } from '@grammyjs/router'
import { Bot } from 'grammy'
import { Config } from './config'

const BOT_TOKEN = Config.TOKEN()

const bot = new Bot(BOT_TOKEN)

const router = new Router(ctx => {
    console.log(ctx);
    
    return 'hello'
})

router.route('hello', ctx => {
    ctx.reply('hello')
})
bot.use(router)
bot.start()