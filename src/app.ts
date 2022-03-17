import { Bot } from 'grammy'
import { Config } from './config'

const BOT_TOKEN = Config.TOKEN()

const bot = new Bot(BOT_TOKEN)

bot.on('message:text',(ctx) => {
    console.log('New update')
    
    console.log(ctx.update)
    
})
bot.start()