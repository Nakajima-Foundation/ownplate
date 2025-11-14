import * as admin from "firebase-admin";

export interface PromotionData {
  promotionId: string;
  promotionName: string;
  enable: boolean;
  type: string;
  hasTerm?: boolean;
  termFrom?: admin.firestore.Timestamp;
  termTo?: admin.firestore.Timestamp;
  discountThreshold: number;
  discountMethod: string;
  discountValue: number;
  paymentRestrictions?: string;
  usageRestrictions?: boolean;
}

export interface UserPromotionHistoryData {
  uid: string;
  restaurantId: string;
  promotionId: string;
  orderId: string;
  totalCharge: number;
  discountPrice: number;
  isStripe: boolean;
  used: boolean;
  createdAt: admin.firestore.FieldValue;
  usedAt: admin.firestore.FieldValue;
}
