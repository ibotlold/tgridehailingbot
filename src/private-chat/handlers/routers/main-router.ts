import { Router } from "@grammyjs/router";
import { Context } from "grammy";
import { isCallbackFromMainMessage, logger } from "../../utils";
import { States } from "../../../dao/user/user-entity";
import { collections } from "../../../database";


export const stateRouter = new Router(mainRouter)

import start from '../start'

stateRouter.route(States.start, start)
//#region Passanger routes
import passanger from '../passanger'
import startPoint from '../start-point'
import endPoint from '../end-point'

stateRouter.route(States.passanger, passanger)
stateRouter.route(States.startPoint, startPoint)
stateRouter.route(States.endPoint, endPoint)
//#endregion

//#region Driver routes
import driver from '../driver'
import registration from '../registration'
import model from '../model'
import year from '../year'
import color from '../color'
import plate from '../plate'
import endRegistration from '../endRegistration'

stateRouter.route(States.driver, driver)
stateRouter.route(States.registration, registration)
stateRouter.route(States.model, model)
stateRouter.route(States.year, year)
stateRouter.route(States.color, color)
stateRouter.route(States.plate, plate)
stateRouter.route(States.endRegistration, endRegistration)
//#endregion

async function mainRouter(ctx: Context):Promise<string | undefined> {
  const user = await collections.users!.finByUserId(ctx.from!.id)
  const userState = user!.state
  logger.verbose('User state', { user: {
    userId: ctx.from!.id,
    state: userState
  }})
  if (!await isCallbackFromMainMessage(ctx)) {
    return undefined
  }
  //Set default state
  if (!userState) {
    await collections.users!.update(user!, {
      state: States.start
    })
  }
  return  userState ?? States.start
}

export async function changeState(ctx: Context, state: States) {
  const user = await collections.users!.finByUserId(ctx.from!.id)
  await collections.users!.update(user!, {
    state: state
  })
}