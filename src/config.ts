const BOT_TOKEN = process.env.YKSTEST_TOKEN
const MongoDB_URL = process.env.YKSTEST_DB_URL

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
        if (typeof BOT_TOKEN !== 'string') {
            console.error('Telegram Bot API authentication token not set')
            process.exit(1)
        }
        return BOT_TOKEN
    }

    public static MONGODB_URL():string {
        if (typeof MongoDB_URL !== 'string') {
            console.error('Mongo DB authentication URL not set')
            process.exit(1)
        }
        return MongoDB_URL
    }
}