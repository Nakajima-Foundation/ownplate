export interface OrderInfoData {
  name: string
  number: string;
  totalCharge: number;
  // options: {[key: string]: [[key: string]: string]}
  timeEstimated: any; // TODO firestore timestamp
}


export class OrderInfo {}
