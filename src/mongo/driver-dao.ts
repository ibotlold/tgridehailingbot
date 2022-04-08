import DataAccessObject from "../dao/dao";
import Driver from "../dao/driver/driver";
import DriverEntity from "../dao/driver/driver-entity";
import mongoDAO from "./abstract-dao";

export default class mongoDriverDAO extends mongoDAO<DriverEntity> 
implements DataAccessObject<Driver> {
  insertUser(driver: Driver): Promise<void> {
    throw new Error("Method not implemented.");
  }
  deleteUser(driver: Driver): Promise<void> {
    throw new Error("Method not implemented.");
  }
  findUserById(driver: number): Promise<Driver> {
    throw new Error("Method not implemented.");
  }
  updateUser(driver: Driver, updates: Partial<Driver>): Promise<void> {
    throw new Error("Method not implemented.");
  }
  
}