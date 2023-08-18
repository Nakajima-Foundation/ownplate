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

}

export interface UserPromotionHistoryData {
  promotionId: string;
}

export default class Promotion extends FirebaseModel<PromotionData> {
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
  termFrom: Date;
  termTo: Date;

  currentOpen: boolean;

  constructor(_model: QueryDocumentSnapshot | DocumentSnapshot<PromotionData>) {
    super(_model);

    const now = new Date();
    const ok = this.data.enable && (!this.data.hasTerm || (this.data.termFrom.toDate() < now && this.data.termTo.toDate() > now))
    this.currentOpen = ok;

    this.promotionId = this.data.promotionId;
    this.promotionName = this.data.promotionName
    this.enable = this.data.enable
    this.type = this.data.type
    this.discountThreshold = this.data.discountThreshold
    this.paymentRestrictions = this.data.paymentRestrictions
    this.usageRestrictions = this.data.usageRestrictions
    this.discountMethod = this.data.discountMethod
    this.discountValue = this.data.discountValue
    this.hasTerm = this.data.hasTerm
    this.termFrom = this.data.termFrom.toDate();
    this.termTo = this.data.termTo.toDate()
    
  }
}
