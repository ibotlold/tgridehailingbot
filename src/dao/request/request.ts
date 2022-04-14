import RequestEntity from "./request-entity"

export default class Request implements RequestEntity {
  startPoint?: string
  endPoint?: string
  note?: string
  price?: string
  method?: string
  constructor(public userId: number) {
    
  }
}