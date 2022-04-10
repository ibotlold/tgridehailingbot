import { logger } from "./logger"

const BOT_TOKEN = process.env.BOT_TOKEN
const MongoDB_URL = process.env.BOT_DB_URL
const Support_URL = process.env.BOT_SUPPORT_URL


/**
* Return config environment variables
* @example
* Config.TOKEN()
*/
export class Config {
  /**
  * Solve possible undefined value for process environment variable.
  * Kill app when env variable is `undefined`.
  * @returns `string`
  */
  public static TOKEN():string {
    return shouldBeString(BOT_TOKEN, 'BOT_TOKEN')
  }
  
  public static MONGODB_URL():string {
    return shouldBeString(MongoDB_URL, 'MongoDB_URL')
  }
  
  public static SUPPORT_URL():string {
    return shouldBeString(Support_URL, 'Support_URL')
  }
}

function shouldBeString(string: string | undefined, name: string):string {
  if (typeof string !== 'string') {
    logger.error(`String ${name} is not set`)
    process.exit(1)
  }
  return string
}