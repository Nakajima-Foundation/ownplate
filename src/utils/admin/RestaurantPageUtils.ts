import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { isNull, cleanObject } from "@/utils/utils";
import { reservationTheDayBefore, daysOfWeek } from "@/config/constant";

import { db } from "@/lib/firebase/firebase9";
import {
  serverTimestamp,
  doc,
  collection,
  query,
  where,
  addDoc,
  updateDoc,
  setDoc,
  getDocs,
  getDoc,
} from "firebase/firestore";

export const getEditShopInfo = (shopInfo: RestaurantInfoData) => {
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
    foodTax: Number(shopInfo.foodTax),
    alcoholTax: Number(shopInfo.alcoholTax),
    openTimes: Object.keys(shopInfo.openTimes).reduce(
      (tmp: { [key: string]: any }, key) => {
        tmp[key] = shopInfo.openTimes[key]
          .filter((el: any) => {
            return el !== null && el?.end !== null && el?.start !== null;
          })
          .sort((a: any, b: any) => {
            return a.start < b.start ? -1 : 1;
          });
        return tmp;
      },
      {},
    ),
    businessDay: shopInfo.businessDay,
    temporaryClosure: shopInfo.temporaryClosure,
    lastOrderTime: shopInfo.lastOrderTime || null,
    category1: shopInfo.category1,
    category2: shopInfo.category2,
    uid: shopInfo.uid,
    publicFlag: shopInfo.publicFlag,
    inclusiveTax: shopInfo.inclusiveTax,
    updatedAt: serverTimestamp(),
    createdAt: shopInfo.createdAt || serverTimestamp(),
  };
  return restaurantData;
};

export const defaultShopInfo = {
  restaurantName: "",
  ownerName: "",
  streetAddress: "",
  city: "",
  state: "",
  zip: "",
  location: {},
  place_id: null,
  phoneNumber: "",
  url: "",
  lineUrl: "",
  instagramUrl: "",
  uberEatsUrl: "",
  introduction: "",
  orderNotice: "",
  orderThanks: "",
  phoneCall: false,
  enablePreline: false,
  emailNotification: false,
  enablePrinter: false,
  acceptUserMessage: false,
  foodTax: 0,
  alcoholTax: 0,
  inclusiveTax: false,
  openTimes: {
    1: [], // mon
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
  },
  businessDay: {
    1: true, // mon
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
  },
  pickUpMinimumCookTime: 25,
  pickUpDaysInAdvance: 3,
  images: {},
  category1: [],
  category2: [],
  publicFlag: false,
  temporaryClosure: [],
  paymentMethods: {},
  personalInfo: "optional",
};

type ShopInfoBussinessTimeError = { [key: string]: string[][] };
type shopInfoValidatorError = {
  [key: string]: string[] | ShopInfoBussinessTimeError;
};

export const shopInfoValidator = (
  shopInfo: RestaurantInfoData,
  errorsPhone: string[],
  files_profile?: File,
  files_cover?: File,
) => {
  const err: shopInfoValidatorError = {};
  [
    "restaurantName",
    "ownerName",
    "streetAddress",
    "city",
    "state",
    "zip",
    "phoneNumber",
    "pickUpMinimumCookTime",
    "pickUpDaysInAdvance",
  ].forEach((name) => {
    err[name] = [];
    if (shopInfo[name as keyof RestaurantInfoData] === "") {
      (err[name] as string[]).push("validationError." + name + ".empty");
    }
  });
  ["introduction", "orderNotice", "orderThanks"].forEach((name) => {
    err[name] = [];
  });
  // validate pickUpMinimumCookTime
  if (Number.isInteger(shopInfo["pickUpMinimumCookTime"])) {
    if (shopInfo["pickUpMinimumCookTime"] > 24 * 60 * 7) {
      (err["pickUpMinimumCookTime"] as string[]).push(
        "validationError." + name + ".tooMuch",
      );
    }
    if (shopInfo["pickUpMinimumCookTime"] < 0) {
      (err["pickUpMinimumCookTime"] as string[]).push(
        "validationError." + name + ".negative",
      );
    }
  } else {
    (err["pickUpMinimumCookTime"] as string[]).push(
      "validationError." + name + ".notNumbery",
    );
  }

  if (
    !reservationTheDayBefore.some(
      (day: { messageKey: string; value: number }) =>
        day.value === shopInfo["pickUpDaysInAdvance"],
    )
  ) {
    (err["pickUpDaysInAdvance"] as string[]).push(
      "validationError." + name + ".invalid",
    );
  }

  const ex = new RegExp("^(https?)://[^\\s]+$");
  err["url"] =
    shopInfo.url && !ex.test(shopInfo.url)
      ? ["validationError.url.invalidUrl"]
      : [];
  err["lineUrl"] =
    shopInfo.lineUrl && !ex.test(shopInfo.lineUrl)
      ? ["validationError.lineUrl.invalidUrl"]
      : [];
  err["instagramUrl"] =
    shopInfo.instagramUrl && !ex.test(shopInfo.instagramUrl)
      ? ["validationError.instagramUrl.invalidUrl"]
      : [];
  err["uberEatsUrl"] =
    shopInfo.uberEatsUrl && !ex.test(shopInfo.uberEatsUrl)
      ? ["validationError.uberEatsUrl.invalidUrl"]
      : [];

  const errorTime: ShopInfoBussinessTimeError = {};
  Object.keys(daysOfWeek).forEach((dayKey: string) => {
    errorTime[dayKey] = [] as string[][];
    [0, 1].forEach((key2) => {
      errorTime[dayKey].push([]);
      if (shopInfo.businessDay[dayKey]) {
        if (shopInfo.openTimes[dayKey] && shopInfo.openTimes[dayKey][key2]) {
          const data = shopInfo.openTimes[dayKey][key2];
          // xor
          if (isNull(data.start) !== isNull(data.end)) {
            errorTime[dayKey][key2].push("validationError.oneInEmpty");
          }
          if (!isNull(data.start) && !isNull(data.end)) {
            if (data.start > data.end) {
              errorTime[dayKey][key2].push("validationError.validBusinessTime");
            }
          }
        } else {
          if (key2 === 0) {
            errorTime[dayKey][key2].push("validationError.noSelect");
          }
        }
      }
    });
  });
  err["time"] = errorTime;
  err["phoneNumber"] = errorsPhone;

  // image
  err["restProfilePhoto"] = [];
  if (isNull(files_profile) && isNull(shopInfo.restProfilePhoto)) {
    err["restProfilePhoto"].push("validationError.restProfilePhoto.empty");
  }

  err["restCoverPhoto"] = [];
  if (isNull(files_cover) && isNull(shopInfo.restCoverPhoto)) {
    err["restCoverPhoto"].push("validationError.restCoverPhoto.empty");
  }

  // todo more validate
  return err;
};

export const copyRestaurant = async (
  shopInfo: RestaurantInfoData,
  uid: string,
  restaurantId: string,
) => {
  const restaurantData = getEditShopInfo(shopInfo);
  restaurantData.restaurantName = restaurantData.restaurantName + " - COPY";
  const newRestaurantData = Object.assign({}, restaurantData, {
    publicFlag: false,
    deletedFlag: false,
    createdAt: serverTimestamp(),
  });

  const restaurantDoc = await addDoc(
    collection(db, "restaurants"),
    cleanObject(newRestaurantData),
  );
  const id = restaurantDoc.id;

  const menuListIds: { [key: string]: string } = {};
  const menus = await getDocs(
    query(
      collection(db, `restaurants/${restaurantId}/menus`),
      where("deletedFlag", "==", false),
    ),
  );

  await Promise.all(
    menus.docs.map(async (a) => {
      const newMenu = await addDoc(
        collection(db, `restaurants/${id}/menus`),
        a.data(),
      );
      menuListIds[a.id] = newMenu.id;
    }),
  );
  // console.log(menus.docs);
  const titles = await getDocs(
    query(
      collection(db, `restaurants/${restaurantId}/titles`),
      where("deletedFlag", "==", false),
    ),
  );

  await Promise.all(
    titles.docs.map(async (a) => {
      const newMenu = await addDoc(
        collection(db, `restaurants/${id}/titles`),
        a.data(),
      );
      menuListIds[a.id] = newMenu.id;
    }),
  );

  const newMenuList: string[] = [];
  (shopInfo.menuLists || []).forEach((a) => {
    if (menuListIds[a]) {
      newMenuList.push(menuListIds[a]);
    }
  });

  await updateDoc(doc(db, `restaurants/${id}`), {
    menuLists: newMenuList,
    restaurantId: id,
  });

  // push list
  const path = `/admins/${uid}/public/RestaurantLists`;
  const restaurantListsDoc = await getDoc(doc(db, path));
  if (restaurantListsDoc.exists()) {
    const restaurantLists = restaurantListsDoc.data().lists;
    restaurantLists.push(id);
    await setDoc(doc(db, path), { lists: restaurantLists }, { merge: true });
  }

  return id;
  // end of list
};
