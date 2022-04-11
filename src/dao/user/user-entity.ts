export enum States {
  start = 'start',
  passanger = 'passanger',
  driver = 'driver',
  request = 'request',
  registration = 'registration',
  model = 'model'
}

export default interface UserEntity {
  userId: number
  status: string
  mainMessage?: number
  state?: States
}