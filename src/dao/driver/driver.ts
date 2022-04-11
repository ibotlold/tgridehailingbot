import DriverEntity from "./driver-entity";

export default class Driver implements DriverEntity {
  public brand?: string
  public model?: string
  public year?: string
  public color?: string
  public plate?: string
  constructor(
    public userId: number,
    ) {
  }
}