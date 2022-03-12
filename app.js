const { Telegraf, Scenes, Markup, session } = require('telegraf')
const { RateLimiter } = require('@riddea/telegraf-rate-limiter')
const mysql = require('mysql2');

var freeDrivers = []
var requestsRide = {}
var currentRides = {}
var matchingRides = {}

// requestsRide['81930487']  = 'Ленина 11\nЛермонтова 49\n200\nкарта' //test ride

const DRIVERS_TTL = 30 * 60 * 1000 //30 min in milliseconds

const rateLimiter = new RateLimiter(1, 1000) // 1 message per 1 second

// mysql setup
const database = mysql.createConnection({
  host: process.env.YKSTEST_DBHOST,
  user: process.env.YKSTEST_DBUSER,
  password: process.env.YKSTEST_DBPASS,
  database: process.env.YKSTEST_DB
})

//telegraf stop
process.once('SIGINT', () => stopApp('SIGINT'))
process.once('SIGTERM', () => stopApp('SIGTERM'))

function start(ctx) {
	ctx.reply('Здравствуйте!\nПубликации заказа /request\nПросмотреть список заказов /driver')
}



//Ride passanger scene
const passangerRideScene = new Scenes.BaseScene('PASSANGER_RIDE')
passangerRideScene.enter(async (ctx) => {
	await ctx.reply('Чат с водителем начат\n_ваши следующие сообщения идут напрямую водителю_',{ parse_mode: 'MarkdownV2'})
})

passangerRideScene.on('text',async (ctx) => {
	await telegraf.telegram.sendMessage(ctx.session.driverId, ctx.message.text)
})

passangerRideScene.on('callback_query',(ctx) => {
	ctx.answerCbQuery()
	ctx.answerCbQuery('Водитель уже в пути')
})


//Passanger queue scene
const passangerQueueScene = new Scenes.BaseScene('PASSANGER_QUEUE')
passangerQueueScene.enter((ctx) => {
	ctx.reply('Ваш заказ опубликован, ожидайте отклик\nОтменить заказ /cancel')
})
passangerQueueScene.command('cancel', async (ctx) => {
	await ctx.reply('Ваш заказ отменен')
	ctx.session.request = null
	delete requestsRide[ctx.from.id]
	return ctx.scene.enter('PASSANGER_ENTER')
})
passangerQueueScene.on('callback_query', async (ctx) => {
	ctx.answerCbQuery('Водитель подобран')
	const driverId = ctx.update.callback_query.data
	ctx.session.driverId = driverId
	ctx.session.carData = ctx.update.callback_query.message.text
	//await telegraf.telegram.sendMessage(driverId,'Ваш текущий заказ\n' + ctx.session.request) // implement callback
	matchingRides[ctx.from.id]()
	delete matchingRides[ctx.from.id]
	currentRides[ctx.from.id] = driverId
	await ctx.reply('Водитель приедет на\n' + ctx.session.carData)
	return ctx.scene.enter('PASSANGER_RIDE')
})


//create request scene
const passangerRequestScene = new Scenes.WizardScene('PASSANGER_REQUEST',
	(ctx) => {
		ctx.reply('Введите начальный адрес')
		return ctx.wizard.next()
	},
	(ctx) => {
		ctx.wizard.state.start = ctx.message.text
		ctx.reply('Введите конечный адрес')
		return ctx.wizard.next()
	},
	(ctx) => {
		ctx.wizard.state.end = ctx.message.text
		ctx.reply('Введите цену')
		return ctx.wizard.next()
	},
	(ctx) => {
		ctx.wizard.state.price = ctx.message.text
		ctx.reply('Введите способ оплаты,\nа также дополнительный комментарий для водителя\n_\\(например, подъезд, сколько человек и т\\.д\\.\\)_',{ parse_mode: 'MarkdownV2'})
		return ctx.wizard.next()
	},
	(ctx) => {
		ctx.session.request = `${ctx.wizard.state.start}\n${ctx.wizard.state.end}\n${ctx.wizard.state.price}\n${ctx.message.text}`
		ctx.scene.enter('PASSANGER_QUEUE')
		const userId = ctx.from.id
		publishRequest(userId, ctx.session.request)
	},
	)



//Passanger enter scene
const passangerEnterScene = new Scenes.BaseScene('PASSANGER_ENTER')
passangerEnterScene.enter((ctx) => {
		ctx.reply('Создать заказ /request\nДля смены роли /start')
})
passangerEnterScene.command('start', (ctx) => {
	ctx.scene.enter('START')
})
passangerEnterScene.command('request', (ctx) => {
	ctx.scene.enter('PASSANGER_REQUEST')
})


//Start scene
const startScene = new Scenes.BaseScene('START')
startScene.enter((ctx) => {
	ctx.session.status = {}
	ctx.reply('Кем вы хотите быть?', Markup.inlineKeyboard([
		Markup.button.callback('Пассажиром', 'PASSANGER'),
		Markup.button.callback('Водителем', 'DRIVER'),
		]))
})
startScene.on('callback_query', (ctx, next) => {
	try {
		ctx.editMessageReplyMarkup()
	} catch(e) {
		console.log(e)
	}
	next()
})
startScene.action('PASSANGER', (ctx) => {
	ctx.answerCbQuery()
	ctx.session.status = 'passanger'
		return ctx.scene.enter('PASSANGER_ENTER')
})
startScene.action('DRIVER', (ctx) => {
	ctx.answerCbQuery()
	ctx.session.status = 'driver'
	return ctx.scene.enter('DRIVER_ENTER')
})

startScene.use((ctx) => ctx.reply('Пожалуйста выберите роль'))


//Ride driver scene
const driverRideScene = new Scenes.BaseScene('DRIVER_RIDE')
driverRideScene.enter(async (ctx) => {
	await ctx.reply('Чат с пассажиром начат \n_ваши следующие сообщения идут напрямую пассажиру_',{ parse_mode: 'MarkdownV2'})
})
driverRideScene.on('text',async (ctx) => {
	await telegraf.telegram.sendMessage(ctx.session.passangerId, ctx.message.text)
})
driverRideScene.on('callback_query',(ctx) => {
	ctx.answerCbQuery()
	ctx.answerCbQuery('Пассажир вас уже ожидает')
})


//Driver queue scene
const driverQueueScene = new Scenes.BaseScene('DRIVER_QUEUE')
driverQueueScene.enter(async (ctx) => {
	await ctx.reply('Ожидайте, вам будут приходить доступные заказы.\nДля смены роли /start')
	freeDrivers.push({
		userId: ctx.from.id,
		car: ctx.session.carData,
		ttl: Date.now() + DRIVERS_TTL
	})

	console.log(freeDrivers)
	getOlderRequestsForUser(ctx.from.id)
})
driverQueueScene.command('start',(ctx) => {
	freeDrivers = freeDrivers.filter( driver => driver.userId != ctx.from.id)
	console.log(freeDrivers)
	return ctx.scene.enter('START')
})
driverQueueScene.on('callback_query', async (ctx) => {
	const passangerId = ctx.update.callback_query.data
	if (!requestsRide[passangerId]) {
		ctx.answerCbQuery('Заказ отменен')
		ctx.editMessageText('~'+ctx.update.callback_query.message.text+'~', { parse_mode: 'MarkdownV2' })
		return
	}
	ctx.answerCbQuery('Заявка отправлена')
	ctx.editMessageReplyMarkup()
	matchingRides[passangerId] = async () => {
		ctx.session.passangerId = passangerId
		ctx.session.request = ctx.update.callback_query.message.text
		await ctx.reply('Ваш текущий заказ\n' + ctx.session.request)
		return ctx.scene.enter('DRIVER_RIDE')
	}
	console.log(ctx)
	telegraf.telegram.sendMessage(passangerId,ctx.session.carData, Markup.inlineKeyboard([
		Markup.button.callback('Принять',ctx.from.id)
		]))
})


//Driver scene
const driverEnterScene = new Scenes.BaseScene('DRIVER_ENTER')

driverEnterScene.enter(async (ctx) => {
	ctx.session.carData = {}
	const userId = ctx.from.id
	const [ rows ] = await carsOfUser(userId)
	if (Array.isArray(rows) && rows.length == 0) {
		await ctx.reply('Необходима регистрация')
		ctx.scene.enter('DRIVER_REGISTRATION')
	} else {
		ctx.session.carData = rows[0].description
		ctx.scene.enter('DRIVER_QUEUE')
	}
})

//Driver registration

const driverRegistrationScene = new Scenes.WizardScene('DRIVER_REGISTRATION',
	(ctx) => {
		ctx.reply('Введите марку авто')
		return ctx.wizard.next()
	},
	(ctx) => {
		ctx.wizard.state.brand = ctx.message.text
		ctx.reply('Введите модель авто')
		return ctx.wizard.next()
	},
	(ctx) => {
		ctx.wizard.state.model = ctx.message.text
		ctx.reply('Введите год авто')
		return ctx.wizard.next()
	},
	(ctx) => {
		ctx.wizard.state.year = ctx.message.text
		ctx.reply('Введите цвет авто')
		return ctx.wizard.next()
	},
	(ctx) => {
		ctx.wizard.state.color = ctx.message.text
		ctx.reply('Введите госномер авто')
		return ctx.wizard.next()
	},
	async (ctx) => {
		ctx.wizard.state.plate = ctx.message.text
		await ctx.reply('Регистрация завершена')
		const carData = `${ctx.wizard.state.brand}\n${ctx.wizard.state.model}\n${ctx.wizard.state.year}\n${ctx.wizard.state.color}\n${ctx.wizard.state.plate}`
		const userId = ctx.from.id
		saveUserCar(userId, carData)
		ctx.session.carData = carData
		return ctx.scene.enter('DRIVER_QUEUE')
	}
	)


//telegraf setup
const telegraf = new Telegraf(process.env.YKSTEST_TOKEN)
telegraf.on("message", async (ctx, next) => {
	const limited = rateLimiter.take(ctx.from.id)
	if (limited) return
	await next()
})
const stage = new Scenes.Stage([
	startScene,
	driverEnterScene,
	driverRegistrationScene,
	driverQueueScene,
	passangerEnterScene,
	passangerRequestScene,
	passangerQueueScene,
	passangerRideScene,
	driverRideScene,
	])
telegraf.use(session())
telegraf.use(stage.middleware())
telegraf.start((ctx) => {
	if (!ctx.session.status) {
		ctx.scene.enter('START')
	}	
})
telegraf.on('text',(ctx) => {
	ctx.reply('Для начала используйте /start')
})

telegraf.command('status', (ctx) => {
	ctx.reply('Количество водителей: ' + freeDrivers.length + '\nЗаказы: ' + Object.keys(requestsRide).length + '\nАктивные поездки: ' + Object.keys(currentRides).length)
})
telegraf.launch()

function saveUserCar(userId, carData) {
	return database.promise().query(
		'INSERT INTO `cars` (`user_id`, `description`) VALUES (?, ?)',
		[userId, carData])
}

async function matchRequest(callback,driverId,passangerId,carData) {
	matchingRides[passangerId] = callback
	await telegraf.telegram.sendMessage(passangerId, carData, Markup.inlineKeyboard([
		Markup.button.callback('Принять', driverId),
	]))
}

//Promise of list of cars of user
function carsOfUser(userId) {
	return database.promise().query(
		'SELECT * FROM `cars` WHERE `user_id` = ?',
		[userId])
}

function publishRequest(userId, description) {
	requestsRide[userId] = description
	console.log(requestsRide)
	new Promise( async (resolve, reject) => {
		for (const driver of freeDrivers) {
			if (driver.ttl < Date.now()) {
				freeDrivers.shift()
				await telegraf.telegram.sendMessage(driver.userId, 'Лента заказов приостановлена.\nДля возобновления /start')
			} else {
				await telegraf.telegram.sendMessage(driver.userId,description,Markup.inlineKeyboard([
		Markup.button.callback('Принять', userId),
		]))
			}
		}
		resolve()
	}).catch((error) => {
		console.log('Error when notifying of drivers')
	})
}

function publishTerminate() {
	for (const driver of freeDrivers) {
		telegraf.telegram.sendMessage(driver.userId, 'Бот временно перестает работать.\nДля возобновления /start')
	}
}

function getOlderRequestsForUser(userId) {
	for (const passangerId in requestsRide) {
		console.log(requestsRide)
		telegraf.telegram.sendMessage(userId, requestsRide[passangerId], Markup.inlineKeyboard([
		Markup.button.callback('Принять', passangerId),
		]))
	}
}

function stopApp(reason) {
	telegraf.stop(reason)
	publishTerminate()
	database = null
}