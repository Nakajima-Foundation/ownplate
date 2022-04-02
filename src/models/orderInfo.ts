export interface OrderMenuItemData {
  category1: string;
  category2: string;
  itemName: string;
  price: number;
}
export interface OrderInfoData {
  name: string
  number: string;
  totalCharge: number;
  total: number;
  tax: number;
  // options: {[key: string]: [[key: string]: string]}
  timeEstimated: any; // TODO firestore timestamp
  menuItems: {[key: string]: OrderMenuItemData};
}


export class OrderInfo {}
