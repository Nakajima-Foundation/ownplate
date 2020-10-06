import { Doc, Field } from '@1amageek/ballcap-admin'
import * as admin from 'firebase-admin';

export interface Menu {
  tax: string
  price: number
}

export type Status =
  100 | // new_order
  200 | // validation_ok
  300 | // order_placed
  400 | // order_accepted
  500 | // cooking_completed
  600   // ready_to_pickup

class Payment {
  stripe!: boolean
}

export default class Order extends Doc {
  @Field status: Status = 100
  @Field order: { [id: string]: Menu } = {}
  @Field sub_total: number = 0
  @Field total: number = 0
  @Field uid!: string
  @Field payment?: Payment
  @Field phoneNumber?: string
  @Field number: number = 0
  @Field sendSMS: boolean = false
  @Field timePlaced!: admin.firestore.Timestamp
  @Field timeEstimated?: admin.firestore.Timestamp
}
