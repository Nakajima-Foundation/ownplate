import {
  Timestamp,
} from "firebase/firestore";

export interface PromotionData {
  promotionId: string;
  promotionName: string;
  enable: boolean;
  type: string;
  discountThreshold: number;
  paymentRestrictions: string;
  usageRestrictions: boolean;
  discountMethod: string;
  discountValue: number;
  hasTerm: boolean;
  termFrom: Timestamp;
  termTo: Timestamp;

  currentOpen?: boolean;

};
