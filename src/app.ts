import { Bot, BotError, GrammyError } from 'grammy'
import { Config } from './config'

import { connectToDatabase } from './database'
import { logger } from './logger'

import privateChat from './private-chat/private-chat'
import publicChat from './public-chat/public-chat'

const BOT_TOKEN = Config.TOKEN()

const bot = new Bot(BOT_TOKEN)

export enum Roles {
  PASSANGER = 'PASSANGER',
  DRIVER = 'DRIVER'
}

logger.verbose('Connecting to database...')
connectToDatabase()
.then(async () => {
  logger.verbose('Connection established')
  bot.filter((ctx) => ctx.chat?.type === 'private').use(privateChat)
  bot.filter((ctx) => ctx.chat?.type !== 'private').use(publicChat)
  logger.verbose('Bot starting...')
  bot.start({
    drop_pending_updates: true
  })
  logger.info('Bot started')
  bot.catch((error) => {
    if (error instanceof BotError) {
      let innerError = error.error
      if (innerError instanceof GrammyError) {
        if (innerError.error_code === 403) {
          return
        }
      }
    }
    logger.error(error.message, { stack: error.stack } )
  })
})
.catch((error: Error) => {
  logger.error('Error trying to connect to database')
  logger.error(error.message, { stack: error.stack } )
  process.exit(1)
})

process.on('uncaughtException',(error) => {
  logger.error('uncaughtException', { stack: error.stack })
})