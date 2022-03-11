const { Telegraf } = require('telegraf')
const mysql = require('mysql2');

// mysql setup
const database = mysql.createConnection({
  host: process.env.YKSTEST_DBHOST,
  user: process.env.YKSTEST_DBUSER,
  password: process.env.YKSTEST_DBPASS,
  database: process.env.YKSTEST_DB
})

//telegraf setup
const telegraf = new Telegraf(process.env.YKSTEST_TOKEN)
telegraf.start((ctx) => ctx.reply('Hello'))
telegraf.command('driver', (ctx) => registerUserAsDriver(ctx))
telegraf.launch()

//telegraf stop
process.once('SIGINT', () => stopApp('SIGINT'))
process.once('SIGTERM', () => stopApp('SIGTERM'))

function registerUserAsDriver(ctx) {
	
}

function stopApp(reason) {
	telegraf.stop(reason)
	database = null
}