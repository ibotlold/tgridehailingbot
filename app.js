const Telegraf = require('telegraf')
const MySQLSession = require('telegraf-session-mysql')

const telegraf = new Telegraf(process.env.YKSTEST_TOKEN)
