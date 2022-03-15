const BOT_TOKEN = process.env.YKSTEST_TOKEN

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
    public static TOKEN() {
        if (typeof BOT_TOKEN !== 'string') {
            console.error('Telegram Bot API authentication token not set')
            process.exit(1)
        }
        return BOT_TOKEN
    }
}