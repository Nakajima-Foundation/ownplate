export interface RestaurantInfoData {
  url: string;
  restaurantName: string;

  restCoverPhoto: string;
  restProfilePhoto: string;

  zip: string;
  state: string;
  city: string;
  streetAddress: string;

  introduction: string;
  menuLists: string[];

  ownerName: string;
  uid: string;

  location: any;
  place_id: string;

  phoneNumber: string;

  lineUrl: string;
  instagramUrl: string;
  orderNotice: string;
  orderThanks: string;
  phoneCall: boolean;
  enablePreline: boolean;
  emailNotification: boolean;
  enablePrinter: boolean;
  enableDeliver: boolean;
  countryCode: string;
  acceptUserMessage: boolean;
  foodTax: number;
  alcoholTax: number;
  inclusiveTax: boolean;
  openTimes: { [key: string]: any[] };
  businessDay: { [key: string]: any[] };

  pickUpMinimumCookTime: number;
  pickUpDaysInAdvance: number;
  images: any;
  publicFlag: boolean;
  deletedFlag: boolean;
  temporaryClosure: any[];

  category1: string[];
  category2: string[];

  createdAt: Date;
}

export class RestaurantInfo {}
