import { Telegraf } from 'telegraf'
import { Config } from './config'

const BOT_TOKEN = Config.TOKEN()

const bot = new Telegraf(BOT_TOKEN)
bot.use((ctx) => {
    console.log('New update')
    
    console.log(ctx.update)
    
})
bot.launch()