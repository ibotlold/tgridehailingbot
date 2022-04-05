import { collections } from "../database";
import { logger } from "./utils";
import UserModel from "../models/user";
import { Roles } from "../app";

export enum States {
    Start = 'start',
    Registration = 'registration',
    Ready = 'ready'
}


export async function getState(userId:number):Promise<string> {
    const user = await findUserById(userId)
    return user?.state || States.Start
}

export async function userDidStarted(userId:number, message_id: number) {
    await setMainMessage(userId, message_id)
    await setState(userId, States.Start)
}

async function setState(userId:number, state: States):Promise<void> {
    await collections.users?.updateOne({ userId: userId }, {
        $set: {
            state: States.Start
        }
    })
}

export async function userDidSelectRole(userId:number, role: Roles):Promise<void> {
    const userFromDB = await findUserById(userId)
    if (!userFromDB) {
        throw new Error('User does not exists')
    }
    await collections.users?.updateOne(userFromDB, {
        $set: { role: role }
    })
    
    logger.info('User selected role', { user: { userId: userId, role: role} })
}


export async function userDidChangeStatus(userId:number, status: string):Promise<void> {
    const user:UserModel = { userId: userId, status: status }
    const userFromDB = await findUserById(userId)
    if (!userFromDB) {
        await collections.users?.insertOne(user)
        return
    }
    await collections.users?.updateOne(userFromDB, {
        $set: { status: user.status},
        $unset: { mainMessage: '', state: '' }
    })
    logger.info('Updated user status', { user: user })
}

/**
 * Resets user to initial state
 * @param userId 
 * @param message_id 
 */
async function setMainMessage(userId:number, message_id:number):Promise<void> {
    const user = await findUserById(userId)
    if (!user) {
        throw new Error('User not found')
    }
    await collections.users?.updateOne(user, {
        $set: {
            mainMessage: message_id,
            state: States.Start
        },
        $unset: {
            role: ''
        }
    })
    logger.verbose('Main message updated', { user: userId, message_id: message_id })
}

export async function findUserById(userId:number):Promise<UserModel | undefined | null> {
    const userFromDB = await collections.users?.findOne({
        userId: userId
    })
    return userFromDB
}

export async function isMainMessage(userId:number, message_id:number):Promise<boolean> {
    const user = await findUserById(userId)
    if (user?.mainMessage === message_id) {
        return true
    }
    return false
}