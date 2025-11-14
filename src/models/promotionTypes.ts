import { FieldValue, Timestamp } from "./firebaseUtils";

// Promotion data (with generic Firebase types)
export interface PromotionDataBase {
  promotionId: string;
  promotionName: string;
  enable: boolean;
  type: string;
  hasTerm: boolean;
  termFrom: Timestamp;
  termTo: Timestamp;
  discountThreshold: number;
  discountMethod: string;
  discountValue: number;
  paymentRestrictions: string;
  usageRestrictions: boolean;
}

// User promotion history (with generic Firebase types)
export interface UserPromotionHistoryDataBase {
  uid: string;
  restaurantId: string;
  promotionId: string;
  orderId: string;
  totalCharge: number;
  discountPrice: number;
  isStripe: boolean;
  used: boolean;
  createdAt: FieldValue;
  usedAt: FieldValue;
}
