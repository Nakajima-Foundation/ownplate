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
  countryCode: string;
  acceptUserMessage: boolean;
  foodTax: number;
  alcoholTax: number;
  inclusiveTax: boolean;
  openTimes: {[key: string]: any[]};
  businessDay: {[key: string]: any[]};

  pickUpMinimumCookTime: number;
  pickUpDaysInAdvance: number;
  images: any;
  publicFlag: boolean;
  deletedFlag: boolean;
  temporaryClosure: any[];

  createdAt: Date;
}

export class RestaurantInfo {}
