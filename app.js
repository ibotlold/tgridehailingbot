const { Telegraf } = require('telegraf')
const { RateLimiter } = require('@riddea/telegraf-rate-limiter')
const mysql = require('mysql2');

const rateLimiter = new RateLimiter(1, 1000) // 1 message per 1 second

// mysql setup
const database = mysql.createConnection({
  host: process.env.YKSTEST_DBHOST,
  user: process.env.YKSTEST_DBUSER,
  password: process.env.YKSTEST_DBPASS,
  database: process.env.YKSTEST_DB
})

//telegraf setup
const telegraf = new Telegraf(process.env.YKSTEST_TOKEN)
telegraf.start((ctx) => start(ctx))
telegraf.command('driver', (ctx) => registerAsDriver(ctx))
telegraf.launch()

//telegraf stop
process.once('SIGINT', () => stopApp('SIGINT'))
process.once('SIGTERM', () => stopApp('SIGTERM'))

function start(ctx) {
	ctx.reply('Здравствуйте!\nПубликации заказа /request\nПросмотреть список заказов /driver')
}

async function registerAsDriver(ctx) {
	const [rows] = await carsOfUser(ctx.update.message.from.id)

	if (Array.isArray(rows) && rows.length == 0) {
		ctx.reply('Регистрация авто:')
	}

	//Авто
	///Марка
	///Модель
	///Цвет
	//Госномер
telegraf.on("message", async (ctx, next) => {
	const limited = rateLimiter.take(ctx.from.id)
	if (limited) return
	await next()
})
}

//Promise of list of cars of user
function carsOfUser(userId) {
	return database.promise().query(
		'SELECT * FROM `cars` WHERE `user_id` = ?',
		[userId])
}

function stopApp(reason) {
	telegraf.stop(reason)
	database = null
}