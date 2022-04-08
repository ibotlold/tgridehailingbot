import DriverEntity from "./driver-entity";

export default class Driver implements DriverEntity {
  userId: number
  vehicle: string
  constructor(userId: number, vehicle: string) {
    this.userId = userId
    this.vehicle = vehicle
  }
}