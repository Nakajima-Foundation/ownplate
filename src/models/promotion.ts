import { QueryDocumentSnapshot, DocumentSnapshot, DocumentData } from "firebase/firestore";
import FirebaseModel from "./firebasemodel";
import {
  Timestamp,
} from "firebase/firestore";


export interface PromotionData extends DocumentData{
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

export interface UserPromotionHistoryData {
  promotionId: string;
}

export default class Promotion extends FirebaseModel<PromotionData> {
  
  constructor(_model: QueryDocumentSnapshot | DocumentSnapshot<PromotionData>) {
    super(_model);
  }
}
