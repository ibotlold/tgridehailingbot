export enum States {
  start = 'start',
  passanger = 'passanger',
  driver = 'driver',
  request = 'request',
  registration = 'registration',
  model = 'model',
  year = 'year',
  color = 'color',
  plate = 'plate',
  endRegistration = 'endRegistration',
  startPoint = 'startPoint',
  endPoint = 'endPoint'
}

export default interface UserEntity {
  userId: number
  status: string
  mainMessage?: number
  state?: States
}