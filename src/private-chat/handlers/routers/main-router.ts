import { Router } from "@grammyjs/router";
import { Context } from "grammy";
import { dao } from "../../private-chat-controller";
import { isCallbackFromMainMessage, logger } from "../../utils";
import { States } from "../../../dao/user/user-entity";


export const stateRouter = new Router(mainRouter)

import start from '../start'
import passanger from '../passanger'

stateRouter.route(States.start, start)
stateRouter.route(States.passanger, passanger)

async function mainRouter(
  ctx: Context
  ):Promise<string | undefined> {
    const user = await dao.userDAO?.findUserById(ctx.from!.id)
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
      dao.userDAO?.updateUser(user!, {
        state: States.start
      })
    }
    return  userState ?? States.start
  }
  
  export async function changeState(ctx: Context, state: States) {
    const user = await dao.userDAO?.findUserById(ctx.from!.id)
    await dao.userDAO?.updateUser(user!, {
      state: state
    })
  }