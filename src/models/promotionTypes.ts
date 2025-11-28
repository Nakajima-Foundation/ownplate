import { FieldValue, Timestamp } from "./firebaseUtils";
import { PromotionType, DiscountMethod, PaymentRestrictions } from "./common";

// Promotion data (with generic Firebase types)
export interface PromotionDataBase {
  promotionId: string;
  promotionName: string;
  enable: boolean;
  type: PromotionType;
  hasTerm: boolean;
  termFrom: Timestamp;
  termTo: Timestamp;
  discountThreshold: number;
  discountMethod: DiscountMethod;
  discountValue: number;
  paymentRestrictions: PaymentRestrictions;
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
