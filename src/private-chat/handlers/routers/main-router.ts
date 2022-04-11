import { Router } from "@grammyjs/router";
import { Context } from "grammy";
import { isCallbackFromMainMessage, logger } from "../../utils";
import { States } from "../../../dao/user/user-entity";
import { collections } from "../../../database";


export const stateRouter = new Router(mainRouter)

import start from '../start'
import passanger from '../passanger'
import driver from '../driver'
import registration from '../registration'


stateRouter.route(States.start, start)
stateRouter.route(States.passanger, passanger)
stateRouter.route(States.driver, driver)
stateRouter.route(States.registration, registration)

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