import { Doc, Field } from '@1amageek/ballcap-admin'

// FIXME: Consider other status
export type AccountStatus = 'connected' | 'failed' | 'none'

export default class Account extends Doc {
  static modelName() { return 'accounts' }
  @Field stripeUserId?: string
  @Field status: AccountStatus = 'none'
  @Field stripeInfo: any = {}
}
