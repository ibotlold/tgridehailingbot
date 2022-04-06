import { collections } from "../database";
import Driver from "../models/driver";

export async function findDriver(userId:number):Promise<Driver | undefined | null> {
  return collections.drivers?.findOne({
    userId: userId
  })
}