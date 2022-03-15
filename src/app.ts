import { Telegraf } from 'telegraf-develop'
import { Config } from './config'

const BOT_TOKEN = Config.TOKEN
if (typeof BOT_TOKEN !== 'string') {
    throw Error('Telegram bot token not found')
}

const bot = new Telegraf(BOT_TOKEN)
