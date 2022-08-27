import * as admin from "firebase-admin";

export interface orderUpdateData {
  restaurantId: string;
  orderId: string;
  status: number;
  timezone: string;
  lng?: string;
  timeEstimated?: admin.firestore.Timestamp;

}
