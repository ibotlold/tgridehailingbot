const BOT_TOKEN = process.env.YKSTEST_TOKEN

export class Config {
    public static TOKEN() {
        if (typeof BOT_TOKEN !== 'string') {
            throw Error('Telegram bot token not found')
        }
        return BOT_TOKEN
    }
}