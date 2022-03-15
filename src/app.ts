import { Telegraf } from 'telegraf-develop'
import { Config } from './config'

const BOT_TOKEN = Config.TOKEN()

const bot = new Telegraf(BOT_TOKEN)
