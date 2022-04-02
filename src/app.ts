import { Bot } from 'grammy'
import { type } from 'os'
import { Config } from './config'

import { connectToDatabase } from './database'
import { logger } from './logger'

import privateChat from './private-chat/private-chat'
import publicChat from './public-chat/public-chat'

const BOT_TOKEN = Config.TOKEN()

export const bot = new Bot(BOT_TOKEN)

logger.verbose('Connecting to database...')
connectToDatabase()
.then(() => {
    logger.verbose('Connection established')
    bot.filter((ctx) => ctx.chat?.type === 'private').use(privateChat)
    bot.filter((ctx) => ctx.chat?.type !== 'private').use(publicChat)
    logger.verbose('Bot starting...')
    bot.start()
    logger.info('Bot started')
    bot.catch((error) => {
        logger.error(JSON.stringify(error, null, '  '))
    })
})
.catch((error: Error) => {
    logger.error('Error trying to connect to database')
    logger.error(JSON.stringify(error))
    process.exit(1)
})

process.on('uncaughtException',(error) => {
    logger.error(`${error.name}:\n${error.message}`, {
        stack: error.stack,
        type: 'process'
    })
})