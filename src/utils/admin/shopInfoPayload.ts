import type { RestaurantInfoData } from "../../models/RestaurantInfo";

// 保存する値の許可リスト。**ここに無いフィールドは、画面で編集できても Firestore に
// 書かれない。** 入力も検証も通り、保存も成功したように見えるので、抜けていても
// 気づけない（invoiceNumber が実際にそうなった）。
//
// Firebase を触らない純粋な変換なので、別ファイルにして単体テストできるようにしてある。
export const getEditShopInfo = (
  shopInfo: RestaurantInfoData,
  // 時刻は呼び出し側から渡す。Firestore の serverTimestamp をここで呼ぶと
  // このファイルが Firebase に依存し、単体テストから読めなくなる。
  now: unknown,
) => {
  const restaurantData = {
    restProfilePhoto: shopInfo.restProfilePhoto,
    restCoverPhoto: shopInfo.restCoverPhoto,
    restaurantName: shopInfo.restaurantName,
    ownerName: shopInfo.ownerName,
    streetAddress: shopInfo.streetAddress,
    images: {
      cover: shopInfo?.images?.cover || {},
      profile: shopInfo?.images?.profile || {},
    },
    city: shopInfo.city,
    state: shopInfo.state,
    zip: shopInfo.zip,
    location: shopInfo.location,
    place_id: shopInfo.place_id,
    phoneNumber: shopInfo.phoneNumber,
    phoneCall: shopInfo.phoneCall,
    emailNotification: shopInfo.emailNotification,
    enablePrinter: shopInfo.enablePrinter,
    enableLunchDinner: shopInfo.enableLunchDinner || false,
    acceptUserMessage: shopInfo.acceptUserMessage,
    countryCode: shopInfo.countryCode,
    url: shopInfo.url,
    lineUrl: shopInfo.lineUrl,
    instagramUrl: shopInfo.instagramUrl,
    uberEatsUrl: shopInfo.uberEatsUrl,
    introduction: shopInfo.introduction,
    enablePreline: shopInfo.enablePreline,
    orderNotice: shopInfo.orderNotice,
    orderThanks: shopInfo.orderThanks,
    pickUpMinimumCookTime: shopInfo.pickUpMinimumCookTime,
    pickUpDaysInAdvance: shopInfo.pickUpDaysInAdvance,
    personalInfo: shopInfo.personalInfo,
    paymentMethods: shopInfo.paymentMethods || {},
    invoiceNumber: shopInfo.invoiceNumber,
    foodTax: Number(shopInfo.foodTax),
    alcoholTax: Number(shopInfo.alcoholTax),
    openTimes: Object.keys(shopInfo.openTimes).reduce<{
      [key: string]: { start: number; end: number }[];
    }>((tmp, key) => {
      tmp[key] = shopInfo.openTimes[key]
        .filter((el): el is { start: number; end: number } => {
          return el !== null && el?.end !== null && el?.start !== null;
        })
        .sort((a, b) => {
          return a.start < b.start ? -1 : 1;
        });
      return tmp;
    }, {}),
    businessDay: shopInfo.businessDay,
    temporaryClosure: shopInfo.temporaryClosure,
    lastOrderTime: shopInfo.lastOrderTime || null,
    category1: shopInfo.category1,
    category2: shopInfo.category2,
    uid: shopInfo.uid,
    publicFlag: shopInfo.publicFlag,
    inclusiveTax: shopInfo.inclusiveTax,
    updatedAt: now,
    createdAt: shopInfo.createdAt || now,
  };
  return restaurantData;
};

// 店舗を複製するときに引き継がない値。
//
// 登録番号は事業者に紐づく。複製先にそのまま持ち込むと、登録を受けていない事業者の
// レシートと請求書に他人の番号が載り、開いて見るまで気づけない。
// getEditShopInfo に項目を足すと自動でこちらにも入るので、引き継いでよいかは
// 足すたびに決める必要がある。
export const getCopyShopInfo = <T extends object>(
  restaurantData: T,
  now: unknown,
) => ({
  ...restaurantData,
  publicFlag: false,
  deletedFlag: false,
  invoiceNumber: "",
  createdAt: now,
});
