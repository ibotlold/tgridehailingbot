import DriverEntity from "./driver-entity";

export default class Driver implements DriverEntity {
  constructor(
    public userId: number,
    public brand: string,
    public model: string,
    public year: string,
    public color: string,
    public plate: string
    ) {
  }
}