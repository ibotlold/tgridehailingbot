import { Collection } from "mongodb";

export default abstract class mongoDAO<T> {
  protected _collection
  constructor(collection: Collection<T>) {
    this._collection = collection
  }
}