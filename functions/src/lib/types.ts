import * as admin from "firebase-admin";

export interface orderUpdateData {
  restaurantId: string;
  orderId: string;
  status: number;
  timezone: string;
  lng?: string;
  timeEstimated?: admin.firestore.Timestamp;
}


export interface updateDataOnorderUpdate {
  status: number;
  updatedAt: admin.firestore.Timestamp;
  orderAcceptedAt?: admin.firestore.Timestamp;

  timeConfirmed?: admin.firestore.Timestamp;
  transactionCompletedAt?: admin.firestore.Timestamp;
  
  timeEstimated?: admin.firestore.Timestamp;
  timePickupForQuery?: admin.firestore.Timestamp;

}
