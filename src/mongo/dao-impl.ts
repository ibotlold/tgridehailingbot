//@ts-nocheck
import { Collection } from "mongodb";
import DataAccessObject from "../dao/dao";
import { logger } from "../logger";



export default class mongoDAO<T>
implements DataAccessObject<T> {
  protected _collection
  constructor(collection: Collection<T>) {
    this._collection = collection
  }
  async insert(item: T):Promise<void> {
    await this._collection.insertOne(item)
    logger.debug('Document created')
  }
  async delete(item: T):Promise<void> {
    await this._collection.findOneAndDelete({
      userId: item.userId
    })
    logger.debug('Document deleted')
  }
  async finByUserId(userId: number):Promise<T> {
    const item = await this._collection.findOne({
      userId: userId
    })
    if (!item) throw new Error('Document does not exist')
    logger.debug('Document found')
    return item
  }
  async  update(item: T, updates: Partial<T>):Promise<void> {
    const result = await this._collection.findOneAndUpdate({
      userId: item.userId
    }, {
        $set: updates
      }
    )
    logger.debug('Document updated', result)
  }
}