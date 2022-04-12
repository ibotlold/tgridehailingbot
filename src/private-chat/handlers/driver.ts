import { Composer } from "grammy"
import { States } from "../../dao/user/user-entity"
import { isUserRegisteredAsDriver } from "../utils"
import { changeState, stateRouter } from "./routers/main-router"

export enum Questions {
  registration = 'Вы еще не регистрировались.\n\nКакая марка вашего авто?',
  model = 'Какая модель авто?',
  year = 'Какой год выпуска авто?',
  color = 'Какой цвет авто?',
  plate = 'Какой госномер авто?',
}

const chat = new Composer()

//Check is driver registered
chat.callbackQuery(States.driver, async (ctx, next) => {
  const checkResult = await isUserRegisteredAsDriver(ctx)
  if (!checkResult) {
    await changeState(ctx, States.registration)
    await next()
  }
}).use(stateRouter)

chat.callbackQuery(States.driver, async ctx => {
  throw new Error('TODO')
})

export default chat