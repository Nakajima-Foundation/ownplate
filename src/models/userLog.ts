import type { Timestamp } from "./firebaseUtils";

// restaurants/:restaurantId/userLog/:uid。functions の orderPlace が注文のたびに書く。
// 最初の注文では lastOrder と lastUpdatedAt は書かれない。
export type UserLogData = {
  uid: string;
  counter: number;
  cancelCounter: number;
  currentOrder: Timestamp;
  lastOrder?: Timestamp;
  restaurantId: string;
  ownerUid: string;
  updateAt: Timestamp;
  lastUpdatedAt?: Timestamp;
};
