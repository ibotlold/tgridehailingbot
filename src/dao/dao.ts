export default interface DataAccessObject<T> {
  insertUser(item: T):Promise<void>
  deleteUser(item: T):Promise<void>
  findUserById(item: number):Promise<T>
  updateUser(item: T, updates: Partial<T>):Promise<void>
}