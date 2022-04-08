export default interface DataAccessObject<T> {
  insert(item: T):Promise<void>
  delete(item: T):Promise<void>
  finByUserId(item: number):Promise<T>
  update(item: T, updates: Partial<T>):Promise<void>
}