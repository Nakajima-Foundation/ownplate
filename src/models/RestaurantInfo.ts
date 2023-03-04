export interface RestaurantInfoData {
  url: string;
  restaurantName: string;
  id: string;
  
  restaurantId: string; // mo
  shopId: string; // mo
  moLastPickupTime: string; // mo

  restCoverPhoto: string;
  restProfilePhoto: string;

  zip: string;
  state: string;
  city: string;
  streetAddress: string;

  introduction: string;
  menuLists: string[];
  numberOfMenus: number;
  
  ownerName: string;
  uid: string;

  location: {
    lat?: number;
    lng?: number;
  };
  place_id: string;

  phoneNumber: string;

  lineUrl: string;
  instagramUrl: string;
  uberEatsUrl: string;
  orderNotice: string;
  orderThanks: string;

  phoneCall: boolean;
  enablePreline: boolean;
  emailNotification: boolean;
  enablePrinter: boolean; // for debug

  isEC: boolean; // set by system
  enableDelivery: boolean;
  enableMoPickup: boolean; // set by sys
  groupId: string; // set by sys
  supportLiff: boolean;

  countryCode: string;
  acceptUserMessage: boolean;
  foodTax: number;
  alcoholTax: number;
  inclusiveTax: boolean;
  openTimes: { [key: string]: {start: any, end: any}[] };
  businessDay: { [key: string]: string[] };

  moOpenTimes: { [key: string]: any[] };
  moBusinessDay: { [key: string]: any[] };

  pickUpMinimumCookTime: number;
  pickUpDaysInAdvance: number;

  paymentMethods: { [key: string]: boolean };

  moPickUpMinimumCookTime: number;
  moPickUpDaysInAdvance: number;

  onTheList: boolean;
  
  isSuspendPickup: boolean; // mo
  isSuspendAllOrder: boolean; // mo
  
  deliveryMinimumCookTime: number;
  suspendUntil: any;

  images: any;
  publicFlag: boolean;
  deletedFlag: boolean;
  temporaryClosure: any[];

  category1: string[];
  category2: string[];

  createdAt: Date;
}

export class RestaurantInfo {}
