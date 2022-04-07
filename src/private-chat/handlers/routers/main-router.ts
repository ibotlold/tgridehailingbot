import { Router } from "@grammyjs/router";
import { Context } from "grammy";
import { getUserState, setUserState } from "../../private-chat-controller";
import { isMainMessage, logger } from "../../utils";

export enum States {
  start = 'start',
  passanger = 'passanger',
  driver = 'driver',
  request = 'request',
  registration = 'registration'
}

export const stateRouter = new Router(mainRouter)

import start from '../start'
import passanger from '../passanger'

stateRouter.route(States.start, start)
stateRouter.route(States.passanger, passanger)

async function mainRouter(
  ctx: Context
  ):Promise<string | undefined> {
    const userState = await getUserState(ctx.from!.id)
    logger.verbose('User state', { user: {
      userId: ctx.from!.id,
      state: userState
    }})
    if (!await isMainMessage(ctx)) {
      return undefined
    }
    //Set default state
    if (!userState) {
      setUserState(ctx.from!.id, States.start)
    }
    return  userState ?? States.start
  }
  
  export async function changeState(ctx: Context, state: States) {
    await setUserState(ctx.from!.id, state)
  }