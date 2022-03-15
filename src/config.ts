const BOT_TOKEN = process.env.YKSTEST_TOKEN

export class Config {
    public static TOKEN() {
        if (typeof BOT_TOKEN !== 'string') {
            console.error('Telegram Bot API authentication token not set')
            process.exit(1)
        }
        return BOT_TOKEN
    }
}