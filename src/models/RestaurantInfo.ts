export interface RestaurantInfoData {
  url: string;
  restaurantName: string;
  id: string;

  restaurantId: string; // mo

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

  hasLine: boolean;
  lineClientId: string;

  isEC: boolean; // set by system
  enableDelivery: boolean;
  deliveryOnlyStore: boolean;
  supportLiff: boolean;

  enableLunchDinner: boolean;

  countryCode: string;
  acceptUserMessage: boolean;
  foodTax: number;
  alcoholTax: number;
  inclusiveTax: boolean;
  // 適格請求書発行事業者の登録番号。未設定の店舗（免税事業者など）は空。
  invoiceNumber?: string;
  openTimes: { [key: string]: { start: number; end: number }[] };
  businessDay: { [key: string]: boolean };

  pickUpMinimumCookTime: number;
  pickUpDaysInAdvance: number;

  personalInfo: string;

  paymentMethods: { [key: string]: boolean };

  onTheList: boolean;

  deliveryMinimumCookTime: number;
  suspendUntil: { toDate: () => Date } | null;

  images: {
    cover?: {
      original?: string;
      path?: string;
      resizedImages?: { [key: string]: string };
    };
    profile?: {
      original?: string;
      path?: string;
      resizedImages?: { [key: string]: string };
    };
  };
  publicFlag: boolean;
  deletedFlag: boolean;
  // Firestore から読んだ直後は Timestamp、画面が日付を足したあとや Wrapper が
  // 変換したあとは素の Date。読む側は seconds の有無で見分けている。
  temporaryClosure: ({ toDate: () => Date; seconds?: number } | Date)[];
  lastOrderTime?: number;
  category1: string[];
  category2: string[];

  createdAt: Date;
}

export class RestaurantInfo {}
