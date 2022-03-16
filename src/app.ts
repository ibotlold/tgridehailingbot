import { Telegraf } from 'telegraf'
import { Config } from './config'
import { Controller } from './controller'

const BOT_TOKEN = Config.TOKEN()

const bot = new Telegraf(BOT_TOKEN)
bot.use((ctx) => {
    console.log('New update')
    
    console.log(ctx.update)
    
})
bot.launch()