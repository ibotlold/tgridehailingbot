import { Router } from '@grammyjs/router'
import { Bot } from 'grammy'
import { Config } from './config'

import { connectToDatabase } from './database'
import { logger } from './logger'

import privateChat from './private-chat'
import publicChat from './public-chat'

const BOT_TOKEN = Config.TOKEN()

export const bot = new Bot(BOT_TOKEN)

export const router = new Router(ctx => {
    switch (ctx.chat?.type) {
        case 'private':
            return 'private'
            break
    
        default:
            return 'public'
            break
    }
})

router.route('private', privateChat)
router.route('public', publicChat)
logger.debug('Connecting to database...')
connectToDatabase()
    .then(() => {
        logger.debug('Connection established')
        bot.use(router)
        logger.debug('Bot starting...')
        bot.start()
        logger.info('Bot started')
        bot.catch((error) => {
            logger.error(JSON.stringify(error))
        })
    })
    .catch((e: Error) => {
        logger.error('Error trying to connect to database')
        logger.error(e)
        process.exit(1)
    })