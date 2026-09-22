import type { RestaurantInfoData } from "../../src/models/RestaurantInfo.ts";

// 型を満たす店舗ひとつ分。テストは必要な項目だけ上書きして使う。
//
// 部分的なオブジェクトを渡していたときは、どの呼び出し元も作らない形を検証していた。
// 実際 getEditShopInfo を引数1つで呼ぶテストが緑のまま通り、updatedAt / createdAt が
// undefined の payload を見ていた。
const base: RestaurantInfoData = {
  url: "https://example.com/r/test",
  restaurantName: "テスト店",
  id: "test-restaurant",
  restaurantId: "test-restaurant",

  restCoverPhoto: "https://example.com/cover.jpg",
  restProfilePhoto: "https://example.com/profile.jpg",

  zip: "1500001",
  state: "東京都",
  city: "渋谷区",
  streetAddress: "1-2-3",

  introduction: "",
  menuLists: [],
  numberOfMenus: 0,

  ownerName: "山田",
  uid: "owner-uid",

  location: { lat: 35.6595, lng: 139.7005 },
  place_id: "",

  phoneNumber: "0312345678",

  lineUrl: "",
  instagramUrl: "",
  uberEatsUrl: "",
  orderNotice: "",
  orderThanks: "",

  phoneCall: false,
  enablePreline: false,
  emailNotification: false,
  enablePrinter: false,

  hasLine: false,
  lineClientId: "",

  isEC: false,
  enableDelivery: false,
  deliveryOnlyStore: false,
  supportLiff: false,

  enableLunchDinner: false,

  countryCode: "JP",
  acceptUserMessage: false,
  foodTax: 8,
  alcoholTax: 10,
  inclusiveTax: true,
  openTimes: {},
  businessDay: {},

  pickUpMinimumCookTime: 25,
  pickUpDaysInAdvance: 3,

  personalInfo: "optional",

  paymentMethods: {},

  onTheList: false,

  deliveryMinimumCookTime: 25,
  suspendUntil: null,

  images: {},
  publicFlag: false,
  deletedFlag: false,
  temporaryClosure: [],
  category1: [],
  category2: [],

  createdAt: new Date("2020-01-01T00:00:00Z"),
};

export const restaurantInfoFixture = (
  overrides: Partial<RestaurantInfoData> = {},
): RestaurantInfoData => ({ ...base, ...overrides });
