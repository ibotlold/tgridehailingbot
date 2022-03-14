const { Telegraf, Scenes, Markup, session } = require('telegraf')
const { RateLimiter } = require('@riddea/telegraf-rate-limiter')
const { markdownv2: format } = require('telegram-format');
const mysql = require('mysql2');
const crypto = require('crypto');

var freeDrivers = []
var requestsRide = {}
var currentRides = {}
var matchingRides = {}

// requestsRide['81930487']  = 'Ленина 11\nЛермонтова 49\n200\nкарта' //test ride

const DRIVERS_TTL = 30 * 60 * 1000 //30 min in milliseconds
const NOTIFICATION_LIMIT = 30

const rateLimiter = new RateLimiter(1, 1000) // 1 message per 1 second

// mysql setup
const database = mysql.createConnection({
  host: process.env.YKSTEST_DBHOST,
  user: process.env.YKSTEST_DBUSER,
  password: process.env.YKSTEST_DBPASS,
  database: process.env.YKSTEST_DB
})

//telegraf stop
process.once('SIGINT', async () => await stopApp('SIGINT'))
process.once('SIGTERM', async () => await stopApp('SIGTERM'))

function start(ctx) {
	ctx.reply('Здравствуйте!\nПубликации заказа /request\nПросмотреть список заказов /driver')
}



//Passanger ride scene
const passangerRideScene = new Scenes.BaseScene('PASSANGER_RIDE')
passangerRideScene.enter(async (ctx) => {
	await ctx.replyWithMarkdownV2('Чат с водителем начат\n_ваши следующие сообщения идут напрямую водителю_', Markup.keyboard(['Завершить заказ']).oneTime().resize())
  currentRides[ctx.from.id].dissmis = async () => {
    delete ctx.session.driverId
    delete ctx.session.carData
    currentRides[ctx.from.id].arrived()
    delete currentRides[ctx.from.id]
    await ctx.reply('Заказ завершен', Markup.removeKeyboard())
    return ctx.scene.enter('PASSANGER_ENTER')
  }
})
passangerRideScene.hears('Завершить заказ', async (ctx, next) => {
	currentRides[ctx.from.id].dissmis()
})

passangerRideScene.on('text',async (ctx,next) => {
  if(ctx.message.entities?.[0].type !== 'bot_command') {
    await telegraf.telegram.sendMessage(ctx.session.driverId, ctx.message.text)
  } else return next();
})

passangerRideScene.on('callback_query',(ctx) => {
	ctx.answerCbQuery('Водитель уже в пути')
  ctx.editMessageText('~'+format.escape(ctx.update.callback_query.message.text)+'~', { parse_mode: 'MarkdownV2' })
  ctx.editMessageReplyMarkup()
})


//Passanger queue scene
const passangerQueueScene = new Scenes.BaseScene('PASSANGER_QUEUE')
passangerQueueScene.enter((ctx) => {
	ctx.reply('Ваш заказ опубликован, ожидайте отклик\nОтменить заказ /cancel')
  setTimeout(async () => {
    await ctx.reply('Ваш заказ отменен')
    delete requestsRide[ctx.from.id]
    return ctx.scene.enter('PASSANGER_ENTER')
  }, DRIVERS_TTL);
})
passangerQueueScene.command('cancel', async (ctx) => {
	await ctx.reply('Ваш заказ отменен')
	delete requestsRide[ctx.from.id]
	return ctx.scene.enter('PASSANGER_ENTER')
})
passangerQueueScene.on('text', async (ctx,next) => {
  if(ctx.message.entities?.[0].type !== 'bot_command') {
    await ctx.reply('Ваш заказ опубликован, ожидайте отклик\nОтменить заказ /cancel')
  } else return next();
})
passangerQueueScene.on('callback_query', async (ctx) => {
	const driverId = ctx.update.callback_query.data
	ctx.session.driverId = driverId
	ctx.session.carData = ctx.update.callback_query.message.text
  let flag = false
  for (const driver in freeDrivers) {
    if (freeDrivers[driver].userId == driverId) {
      flag = true
    }
  }
  if (!flag) {
    ctx.answerCbQuery('Водитель недоступен')
    ctx.editMessageReplyMarkup()
    return ctx.editMessageText('~'+format.escape(ctx.update.callback_query.message.text)+'~', { parse_mode: 'MarkdownV2' })
  }
  ctx.answerCbQuery('Водитель подобран')
  const driverRideId = randomRideId()
	for (const driver in matchingRides[ctx.from.id]) {
    if (driver == driverId) {
      matchingRides[ctx.from.id][driver].accept(driverRideId)
    } else {
      matchingRides[ctx.from.id][driver].decline()
    }
  }
  delete requestsRide[ctx.from.id]
	delete matchingRides[ctx.from.id]
  currentRides[ctx.from.id] = {}
	currentRides[ctx.from.id].driverId = driverId
	// await ctx.reply('Водитель приедет на\n' + ctx.session.carData)
  const rideId = randomRideId()
  console.log('Активирована поездка: ' + JSON.stringify({passanger: ctx.from.id, driver: driverId, rideId: {passanger: rideId, driver: driverRideId}}))
  await ctx.replyWithMarkdownV2('Поездка: #' + randomRideId() + '\nВодитель приедет на \n' + format.escape(ctx.session.carData))
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
    const userId = ctx.from.id
    matchingRides[userId] = {}
		publishRequest(userId, ctx.session.request)
    return ctx.scene.enter('PASSANGER_QUEUE')
	},
	)



//Passanger enter scene
const passangerEnterScene = new Scenes.BaseScene('PASSANGER_ENTER')
passangerEnterScene.enter((ctx) => {
		ctx.reply('Создать заказ /request\nПовторить недавний заказ /repeat\nДля смены роли /start')
})
passangerEnterScene.command('start', (ctx) => {
	ctx.scene.enter('START')
})
passangerEnterScene.command('repeat', async (ctx) => {
  if (ctx.session.request) {
    await ctx.reply('Недавний заказ:\n'+ctx.session.request)
    const userId = ctx.from.id
    matchingRides[userId] = {}
		publishRequest(userId, ctx.session.request)
    return ctx.scene.enter('PASSANGER_QUEUE')
  } else {
    ctx.reply('Недавний заказ отсутствует\nСоздать заказ /request\nДля смены роли /start')
  }
})
passangerEnterScene.command('request', (ctx) => {
	ctx.scene.enter('PASSANGER_REQUEST')
})
passangerEnterScene.on('text', (ctx,next) => {
  if(ctx.message.entities?.[0].type !== 'bot_command') {
    ctx.reply('Создать заказ /request\nПовторить недавний заказ /repeat\nДля смены роли /start')
  } else return next();
})


//Start scene
const startScene = new Scenes.BaseScene('START')
startScene.enter((ctx) => {
	ctx.session.status = {}
  ctx.reply('Кем вы хотите быть?\nПоддержка @yotteam', Markup.inlineKeyboard([
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


//Driver ride scene
const driverRideScene = new Scenes.BaseScene('DRIVER_RIDE')
driverRideScene.enter(async (ctx) => {
	await ctx.replyWithMarkdownV2('Чат с пассажиром начат \n_ваши следующие сообщения идут напрямую пассажиру_',Markup.keyboard([['Выходите'],['Завершить заказ']]).resize())
  clearTimeout(freeDrivers[ctx.session.driverPos].ttl)
  freeDrivers = freeDrivers.filter( driver => driver.userId != ctx.from.id )
  currentRides[ctx.session.passangerId].arrived = async () => {
    await ctx.reply('Заказ завершен',Markup.removeKeyboard())
    delete ctx.session.passangerId
    delete ctx.session.request
    return ctx.scene.enter('DRIVER_QUEUE')
  }
})
driverRideScene.hears('Завершить заказ', async (ctx,next) => {
  currentRides[ctx.session.passangerId].dissmis()
})
driverRideScene.on('text',async (ctx,next) => {
  if(ctx.message.entities?.[0].type !== 'bot_command') {
    await telegraf.telegram.sendMessage(ctx.session.passangerId, ctx.message.text)
  } else return next();
})
driverRideScene.on('callback_query',(ctx) => {
	ctx.answerCbQuery()
	ctx.answerCbQuery('Пассажир вас уже ожидает')
})


//Driver queue scene
const driverQueueScene = new Scenes.BaseScene('DRIVER_QUEUE')
driverQueueScene.enter(async (ctx) => {
	await ctx.reply('Ожидайте, вам будут приходить доступные заказы.\nДля смены роли /start')
    let driverTtl = setTimeout(async () => {
      freeDrivers = freeDrivers.filter((driver) => driver.userId != ctx.from.id)
      await ctx.reply('Время ожидания истекло\n')
      return ctx.scene.enter('START')
    }, DRIVERS_TTL)
    ctx.session.driverPos = freeDrivers.push({
      userId: ctx.from.id,
      car: ctx.session.carData,
      ttl: driverTtl
    }) - 1
  console.log('Активный водитель: ' + ctx.from.id);
	console.log(JSON.stringify(ctx.session.carData))
	getOlderRequestsForUser(ctx.from.id)
})
driverQueueScene.command('start',(ctx) => {
  clearTimeout(freeDrivers[ctx.session.driverPos].ttl)
	freeDrivers = freeDrivers.filter( driver => driver.userId != ctx.from.id)
	return ctx.scene.enter('START')
})
driverQueueScene.on('text', async (ctx,next) => {
  if(ctx.message.entities?.[0].type !== 'bot_command') {
    await ctx.reply('Ожидайте, вам будут приходить доступные заказы.\nДля смены роли /start')
  } else return next();
})
driverQueueScene.on('callback_query', async (ctx) => {
	const passangerId = ctx.update.callback_query.data
	if (!requestsRide[passangerId] || currentRides[passangerId]) {
		ctx.answerCbQuery()
		ctx.editMessageText('~'+format.escape(ctx.update.callback_query.message.text)+'~', { parse_mode: 'MarkdownV2' })
		return
	}
	ctx.answerCbQuery('Заявка отправлена')
	ctx.editMessageReplyMarkup()
  matchingRides[passangerId][ctx.from.id] = {
    accept: async (driverRideId) => {
      	ctx.session.passangerId = passangerId
      	ctx.session.request = ctx.update.callback_query.message.text
        // await ctx.replyWithMarkdownV2('Поездка: `' + randomRideId() + '`\nВодитель приедет на \n' + format.escape(ctx.session.carData))
      	// await ctx.reply('Ваш текущий заказ\n' + ctx.session.request)
        await ctx.replyWithMarkdownV2('Заказ: #' + driverRideId + '\nВаш текущий заказ\n' + format.escape(ctx.session.request))
      	return ctx.scene.enter('DRIVER_RIDE')
    },
    decline: async () => {
      ctx.editMessageText('~'+format.escape(ctx.update.callback_query.message.text)+'~', { parse_mode: 'MarkdownV2' })
      return
    }
  }
	telegraf.telegram.sendMessage(passangerId,ctx.session.carData, Markup.inlineKeyboard([
		Markup.button.callback('Принять',ctx.from.id)
		]))
})


//Driver enter scene
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

telegraf.command('status', (ctx) => {
	ctx.reply('Свободных водителей: ' + freeDrivers.length + '\nЗаказы: ' + Object.keys(requestsRide).length + '\nАктивные поездки: ' + Object.keys(currentRides).length)
})
telegraf.on('text',(ctx,next) => {
  ctx.reply('Для начала используйте /start')
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
	console.log('Заказ:\n' + JSON.stringify(requestsRide))
  	new Promise( async (resolve, reject) => {
      let count = 0 //Count for driver notification limit
      for (const driver of freeDrivers) {
        if (count <= NOTIFICATION_LIMIT)
        count = count + 1
        await telegraf.telegram.sendMessage(driver.userId,description,Markup.inlineKeyboard([
      Markup.button.callback('Принять', userId),
      ]))
  }
		resolve()
	}).catch((error) => {
		console.log('Error when notifying of drivers')
	})
}

async function publishTerminate() {
	for (const driver of freeDrivers) {
		await telegraf.telegram.sendMessage(driver.userId, 'Бот временно перестает работать.\nЧерез некоторое время воспользуйтесь /start')
	}
}

function getOlderRequestsForUser(userId) {
	for (const passangerId in requestsRide) {
		telegraf.telegram.sendMessage(userId, requestsRide[passangerId], Markup.inlineKeyboard([
		Markup.button.callback('Принять', passangerId),
		]))
	}
}

async function stopApp(reason) {
await publishTerminate()
for (const passangerId in currentRides) {
  let driverId = currentRides[passangerId].driverId
  await currentRides[passangerId].dissmis()
  await telegraf.telegram.sendMessage(driverId, 'Бот временно перестает работать.\nЧерез некоторое время воспользуйтесь /start')
  await telegraf.telegram.sendMessage(passangerId, 'Бот временно перестает работать.\nЧерез некоторое время воспользуйтесь /start')
}
telegraf.stop(reason)
database.destroy()
}
process.on('uncaughtException', err => {
  console.error(err && err.stack)
})

function randomRideId() {
  return crypto.randomUUID().substring(0,8)
}