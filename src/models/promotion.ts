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
  currentOpen: boolean;

  constructor(_model: QueryDocumentSnapshot | DocumentSnapshot<PromotionData>) {
    super(_model);

    const now = new Date();
    const ok = this.data.enable && (!this.data.hasTerm || (this.data.termFrom.toDate() < now && this.data.termTo.toDate() > now))
    this.currentOpen = ok;
    this.data.currentOpen = ok;
  }
}
