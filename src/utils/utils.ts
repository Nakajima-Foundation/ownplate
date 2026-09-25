import { ref, computed, onMounted, unref, Ref } from "vue";
import type { User } from "firebase/auth";
import type { DocumentData } from "firebase/firestore";

import { ShopOwnerData, PartnerData } from "@/models/ShopOwner";
import { OrderInfoData, OrderItemData } from "@/models/orderInfoData";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { roundPrice } from "./price";
import { MenuData } from "@/models/menu";
import { CartItemsType } from "@/models/cartType";

import {
  order_status,
  regionalSetting,
  partners,
  stripe_regions_jp,
  soundFiles,
} from "@/config/constant";
import { firebaseConfig, ownPlateConfig } from "@/config/project";

import { defaultHeader } from "@/config/header";

import { formatOption } from "@/utils/strings";
import { parsePhoneNumber, formatNational } from "@/utils/phoneutil";
import isURL from "validator/lib/isURL";
import isLatLong from "validator/lib/isLatLong";

import {
  isNull,
  selectedOptionNames,
  selectedOptionsPrice,
} from "./commonUtils";

import { useRoute, useRouter } from "vue-router";
import { useGeneralStore } from "../store";
import { useUserStore } from "@/store/user";
import { useI18n } from "vue-i18n";
import i18n from "../lib/vue-i18n";

// 捕まえたものは何でもありうる。在否の判定も読みも try の中に置く。どちらも
// getter や Proxy の罠になりうるので、外に置くと守りを素通りして投げる。
export const errorCode = (error: unknown): string | undefined => {
  try {
    if (error === null || typeof error !== "object" || !("code" in error)) {
      return undefined;
    }
    const code = error.code;
    return typeof code === "string" ? code : undefined;
  } catch {
    return undefined;
  }
};

export const errorMessage = (error: unknown): string | undefined => {
  try {
    if (error === null || typeof error !== "object" || !("message" in error)) {
      return undefined;
    }
    const message = error.message;
    return typeof message === "string" ? message : undefined;
  } catch {
    return undefined;
  }
};

export const stripeRegion = stripe_regions_jp; // TODO remove
// from mixin
export const useRestaurantId = () => {
  const route = useRoute();
  return computed(() => {
    return route.params.restaurantId as string;
  });
};

export const getRestaurantId = () => {
  const route = useRoute();
  return route.params.restaurantId as string;
};

// 店舗そのものと、店名と写真だけを複製した「いいね」の記録の両方から呼ばれるので、
// 実際に読む2つの欄だけを要求する。
export const resizedProfileImage = (
  restaurant: {
    images?: { profile?: { resizedImages?: { [key: string]: string } } };
    restProfilePhoto?: string;
  },
  size: string,
) => {
  return (
    (restaurant.images?.profile?.resizedImages || {})[size] ||
    restaurant.restProfilePhoto
  );
};

export const arrayChunk = <T>(arr: T[], size = 1): T[][] => {
  const array = [...arr];
  return array.reduce<T[][]>((current, _value, index) => {
    return index % size
      ? current
      : [...current, array.slice(index, index + size)];
  }, []);
};

export const previewLink = (props: { shopInfo: RestaurantInfoData }) => {
  return computed(() => {
    return "/r/" + props.shopInfo?.restaurantId;
  });
};
export const shareUrlAdmin = (props: { shopInfo: RestaurantInfoData }) => {
  const link = previewLink(props);
  return computed(() => {
    return location.protocol + "//" + location.host + link.value;
  });
};

export const sleep = async (seconds: number) => {
  return await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

export const shareUrl = (prefix: string) => {
  const route = useRoute();
  const restaurantId = route.params.restaurantId;
  return (
    location.protocol + "//" + location.host + prefix + "/r/" + restaurantId
  );
};

export const doc2data = <T = DocumentData>(dataType: string) => {
  // 受け取るのは Firestore の snapshot だが、使うのは id と data() だけ。型をその2つに
  // 狭めてあるので、試験から最小の値で呼べる。Firestore の DocumentSnapshot も
  // QueryDocumentSnapshot もこの形を構造的に満たすため、呼び出し側は変わらない。
  return (_doc: { id: string; data: () => DocumentData | undefined }): T => {
    const data = _doc.data() || ({} as DocumentData);
    data.id = _doc.id;
    data._dataType = dataType;
    return data as T;
  };
};

export const array2obj = <T extends { id?: string }>(array: T[]) => {
  return array.reduce<{ [key: string]: T }>((tmp, current) => {
    if (current.id !== undefined) {
      tmp[current.id] = current;
    }
    return tmp;
  }, {});
};

export const num2simpleTime = (num: number) => {
  return [
    String(Math.floor(num / 60)).padStart(2, "0"),
    String(num % 60).padStart(2, "0"),
  ].join("");
};
export const num2simpleFormatedTime = (num: number) => {
  return [
    String(Math.floor(num / 60)).padStart(2, "0"),
    ":",
    String(num % 60).padStart(2, "0"),
  ].join("");
};

// computed の再計算は setup の外で走るので、useI18n ではなく global を使う。
export const num2time = (num: number) => {
  const { locale, t } = i18n.global;
  // legacy: false では locale は ref だが、型は文字列と宣言されている。
  const localeName = unref(locale);

  if (num === 0 || num === 60 * 24) {
    return t("shopInfo.midnight");
  }
  if (num === 60 * 12) {
    return t("shopInfo.noon");
  }
  const offsetTime = localeName === "ja" ? 12 : 13;
  const isPm = num >= 60 * 12;
  if (num >= 60 * offsetTime) {
    num = num - 60 * 12;
  }
  const formatedTime = num2simpleFormatedTime(num);

  if (isPm) {
    return t("shopInfo.pm", { formatedTime }, 1);
  }
  return t("shopInfo.am", { formatedTime }, 0);
};

export const countObj = (obj: unknown): number => {
  if (Array.isArray(obj)) {
    return obj.reduce<number>((tmp, value) => {
      // nested array
      if (Array.isArray(value)) {
        return tmp + countObj(value);
      }
      return tmp + 1;
    }, 0);
  }
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce<number>((tmp, key) => {
      return countObj((obj as { [key: string]: unknown })[key]) + tmp;
    }, 0);
  }
  return 0;
};

export const cleanObject = <T>(obj: { [key: string]: T }) => {
  return Object.keys(obj).reduce<{ [key: string]: T }>((tmp, key) => {
    if (!isNull(obj[key])) {
      tmp[key] = obj[key];
    }
    return tmp;
  }, {});
};

export const useSoundPlay = () => {
  const generalStore = useGeneralStore();
  return (reason?: string) => {
    generalStore.pingOrderEvent();
    if (reason) {
      console.log("order: call play: " + reason);
    } else {
      console.log("order: call play");
    }
  };
};

export const getSoundIndex = (nameKey: string) => {
  if (nameKey) {
    const index = soundFiles.findIndex((data) => data.nameKey === nameKey);
    return index >= 0 ? index : 0;
  }
  return 0;
};

export const arraySum = (arr: number[]) => {
  return Object.values(arr || [0]).reduce(
    (accumulator, currentValue) => accumulator + currentValue,
  );
};
export const arrayOrNumSum = (arr: number | number[]) => {
  return Array.isArray(arr) ? arraySum(arr) : arr || 0;
};

export const forceArray = <T>(arr: T | T[]): T[] => {
  return Array.isArray(arr) ? arr : [arr];
};

export const convOrderStateForText = (
  orderState: string,
  orderInfo: { isEC?: boolean } | null | undefined,
) => {
  if (orderInfo?.isEC) {
    if (orderState === "ready_to_pickup") {
      return "ready_to_shipping";
    }
    if (orderState === "transaction_complete") {
      return "shipping_complete";
    }
  }
  return orderState;
};

export const getOrderItems = (
  orderInfo: OrderInfoData,
  menuObj: { [key: string]: MenuData },
) => {
  if (orderInfo.order && orderInfo.menuItems) {
    return Object.keys(orderInfo.order).reduce(
      (tmp: OrderItemData[], menuId) => {
        const numArray = Array.isArray(orderInfo.order[menuId])
          ? orderInfo.order[menuId]
          : [orderInfo.order[menuId]];
        const optArray = Array.isArray(orderInfo.order[menuId])
          ? orderInfo.options[menuId]
          : [orderInfo.options[menuId]];
        Object.keys(numArray).forEach((numKey: string) => {
          const item = orderInfo.menuItems[menuId] || menuObj[menuId] || {};
          item.images = (menuObj[menuId] || {}).images;
          item.itemPhoto = (menuObj[menuId] || {}).itemPhoto;
          tmp.push({
            item,
            count: numArray[Number(numKey)],
            id: menuId,
            options: optArray[Number(numKey)],
            orderIndex: [menuId, numKey],
          });
        });
        return tmp;
      },
      [],
    );
  }
  return [];
};

export const itemOptionCheckbox2options = (
  itemOptionCheckbox: string[] | null | undefined,
): string[][] => {
  // HACK: Dealing with a special case (probalby a bug in the menu editor)
  if (
    itemOptionCheckbox &&
    itemOptionCheckbox.length === 1 &&
    !itemOptionCheckbox[0]
  ) {
    // console.log("Special case: itemOptionCheckbox===['']");
    return [];
  }
  return (itemOptionCheckbox || []).map((option: string) => {
    return option.split(",").map((choice) => {
      return choice.trim();
    });
  });
};
// 税の計算が読むのは店舗の3つとメニューの `tax` だけ。RestaurantInfoData / MenuData
// 全体を要求すると、「この金額はもう税込みだから触るな」を表すために
// { inclusiveTax: true } を渡している呼び出し元（Cart まわり）が通らない。
// inclusiveTax が真の枝では税率を読まないので、そのときだけ税率を省ける形にしてある。
export type TaxableShop =
  | { inclusiveTax: true; foodTax?: number; alcoholTax?: number }
  | { inclusiveTax?: boolean; foodTax: number; alcoholTax: number };

export type TaxableMenu = { tax?: string };
export type PricedMenu = TaxableMenu & { price: number };

export const taxRate = (shopInfo: TaxableShop, item: TaxableMenu) => {
  if (shopInfo.inclusiveTax) {
    return 1;
  }
  if (item.tax === "alcohol") {
    return 1 + shopInfo.alcoholTax * 0.01;
  }
  return 1 + shopInfo.foodTax * 0.01;
};

export const priceWithTax = (shopInfo: TaxableShop, menu: PricedMenu) => {
  return Math.round(
    (() => {
      if (shopInfo.inclusiveTax) {
        return menu.price;
      }
      if (menu.tax === "alcohol") {
        return (1 + shopInfo.alcoholTax * 0.01) * menu.price;
      }
      return (1 + shopInfo.foodTax * 0.01) * menu.price;
    })(),
  );
};

// 問い合わせ先に使う提携先。`getPartner` は知らない id を穴のまま残すので、
// 先頭が穴のこともある。埋まっている最初のものを選ぶ。
export const firstKnownPartner = (
  found: (PartnerData | undefined)[],
): PartnerData | undefined =>
  found.find((partner): partner is PartnerData => partner !== undefined);

export const getPartner = (shopOwner: ShopOwnerData) => {
  return ((shopOwner || {}).partners || []).map((p: string) => {
    const match = partners.find((a: PartnerData) => {
      return a.id === p;
    });
    return match;
  });
};

export const isLineEnabled = !!ownPlateConfig.line;

export const displayOption = (
  option: string,
  shopInfo: RestaurantInfoData,
  item: MenuData,
) => {
  const { n } = useI18n();
  return formatOption(option, (price) => {
    return n(roundPrice(price * taxRate(shopInfo, item)), "currency");
  });
};

const useIsInLiff = () => {
  const route = useRoute();

  return computed(() => {
    return (route.fullPath || "").startsWith(`/liff/`);
  });
};

export const useLiffIndexId = () => {
  const route = useRoute();

  return computed(() => {
    return route.params.liffIndexId as string;
  });
};

export const useLiffBasePath = () => {
  const liffIndexId = useLiffIndexId();
  return computed(() => {
    return `/liff/${liffIndexId.value}`;
  });
};

export const routeMode = () => {
  const isInLiff = useIsInLiff();

  return computed(() => {
    if (isInLiff.value) {
      return "liff";
    }
    return "normal";
  });
};

// "" or "/mo" or "/liff/hoge"
export const useBasePath = () => {
  const isInLiff = useIsInLiff();
  const liffBasePath = useLiffBasePath();

  return computed(() => {
    if (isInLiff.value) {
      return liffBasePath.value;
    }
    return "";
  });
};

// "/" or "/mo", or "/liff/hoge"
export const useTopPath = () => {
  const inLiff = useIsInLiff();
  const liffBasePath = useLiffBasePath();

  return computed(() => {
    if (inLiff.value) {
      return liffBasePath.value;
    }
    return "/";
  });
};

export const validUrl = (url: string) => {
  return isURL(url, {
    protocols: ["http", "https"],
    require_protocol: true,
    allow_fragments: false,
  });
};

export const validLocation = (location: { lat?: number; lng?: number }) => {
  return isLatLong([location.lat || "", location.lng || ""].join(","));
};
export const validPlaceId = (placeId: string) => {
  return /^[a-zA-Z0-9-_]+$/.test(placeId) || placeId === "";
};

export const convOptionArray2Obj = <T>(obj: { [key: string]: T[] }) => {
  return Object.keys(obj).reduce<{ [key: string]: { [key: string]: T } }>(
    (newObj, objKey) => {
      newObj[objKey] = obj[objKey].reduce<{ [key: string]: T }>(
        (tmp, value, key) => {
          tmp[key] = value;
          return tmp;
        },
        {},
      );
      return newObj;
    },
    {},
  );
};

export const prices2subtotal = (prices: { [key: string]: number[] }) => {
  return Object.keys(prices).reduce<{ [key: string]: number }>(
    (tmp, menuId) => {
      tmp[menuId] = prices[menuId].reduce((a, b) => a + b, 0);
      return tmp;
    },
    {},
  );
};

export const getPriceWithTax = (
  subTotal: number,
  menu: TaxableMenu,
  shopInfo: TaxableShop,
) => {
  if (!shopInfo.inclusiveTax) {
    if (menu.tax === "alcohol") {
      return (1 + shopInfo.alcoholTax * 0.01) * subTotal;
    }
    return (1 + shopInfo.foodTax * 0.01) * subTotal;
  }
  return subTotal;
};

export const subtotal2total = (
  subTotal: { [key: string]: number },
  cartItems: CartItemsType,
  shopInfo: RestaurantInfoData,
) => {
  return Object.keys(subTotal).reduce((tmp, menuId) => {
    const menu: Partial<MenuData> = cartItems[menuId] || {};
    return tmp + getPriceWithTax(subTotal[menuId], menu, shopInfo);
  }, 0);
};

export const getPrices = (
  multiple: number,
  orders: { [key: string]: number[] },
  cartItems: CartItemsType,
  trimmedSelectedOptions: { [key: string]: SelectedOption[] },
) => {
  const ret: { [key: string]: number[] } = {};

  Object.keys(orders).forEach((menuId) => {
    const menu: Partial<MenuData> = cartItems[menuId] || {};
    ret[menuId] = [];
    orders[menuId].forEach((num, orderKey) => {
      const selectedOptionsRaw = trimmedSelectedOptions[menuId][orderKey] || [];
      const price = selectedOptionsPrice(
        selectedOptionsRaw,
        menu.itemOptionCheckbox,
        multiple,
        menu.price,
      );
      ret[menuId].push(price * num);
    });
  });
  return ret;
};

type SelectedOption = (boolean | string)[];

export const getTrimmedSelectedOptions = (
  orders: { [key: string]: number[] },
  cartItems: CartItemsType,
  selectedOptions: { [key: string]: SelectedOption[] },
) => {
  return Object.keys(orders).reduce<{ [key: string]: SelectedOption[] }>(
    (ret, id) => {
      const menu: Partial<MenuData> = cartItems[id] || {};
      const options = itemOptionCheckbox2options(menu.itemOptionCheckbox);
      const selectedOption = selectedOptions[id].map((selected) => {
        if (Array.isArray(selected) && selected.length > options.length) {
          const newopt = [...selected];
          return newopt.slice(0, options.length);
        }
        return selected;
      });
      ret[id] = selectedOption;
      return ret;
    },
    {},
  );
};

export const getPostOption = (
  trimmedSelectedOptions: { [key: string]: SelectedOption[] },
  cartItems: CartItemsType,
) => {
  return Object.keys(trimmedSelectedOptions).reduce<{
    [key: string]: string[][];
  }>((ret, id) => {
    const menu: Partial<MenuData> = cartItems[id] || {};
    ret[id] = (trimmedSelectedOptions[id] || []).map((item) =>
      selectedOptionNames(item, menu.itemOptionCheckbox),
    );
    return ret;
  }, {});
};

export const useUserData = () => {
  const userStore = useUserStore();
  const route = useRoute();

  const isAdmin = computed(() => {
    return !!userStore.uidAdmin;
  });
  const uid = computed(() => {
    return userStore.uid;
  });
  const isUser = computed(() => {
    return !!userStore.uidUser;
  });

  const isLiffUser = computed(() => {
    return !!userStore.uidLiff;
  });
  const isLineUser = computed(() => {
    const claims = userStore.claims;
    return !!claims?.line;
  });
  const claims = computed(() => {
    return userStore.claims;
  });
  const inLiff = computed(() => {
    return !!route.params.liffIndexId;
  });
  const user = computed(() => {
    return userStore.user;
  });

  const isAnonymous = computed(() => {
    return userStore.isAnonymous;
  });

  return {
    user,
    uid,
    isAdmin,
    isUser,
    isLiffUser,
    isLineUser,
    inLiff,
    isAnonymous,
    claims,
  };
};

export const useToggle = (defaultValue = false) => {
  const value = ref(defaultValue);
  const toggleOn = () => {
    value.value = true;
  };
  const toggleOff = () => {
    value.value = false;
  };
  const toggle = () => {
    value.value = !value.value;
  };
  return {
    value,
    toggleOn,
    toggleOff,
    toggle,
  };
};

export const isJapan = ownPlateConfig.region === "JP";
export const serviceKey = isJapan ? "omochikaeri" : "ownPlate";

export const defaultTitle = defaultHeader.title;

export const useAdminUids = () => {
  const userStore = useUserStore();

  const isOwner = computed(() => {
    return !userStore.isSubAccount;
  });
  const uid = computed(() => {
    return userStore.uidAdmin;
  });
  const ownerUid = computed(() => {
    return userStore.isSubAccount ? userStore.parentId : userStore.uidAdmin;
  });
  const emailVerified = computed(() => {
    return (userStore.user as User)?.emailVerified;
  });
  return {
    isOwner,
    uid,
    ownerUid,
    emailVerified,
  };
};

export const usePhoneNumber = (shopInfo: Ref<RestaurantInfoData>) => {
  const countries = stripe_regions_jp.countries;

  const parsedNumber = computed(() => {
    const countryCode = shopInfo.value.countryCode || countries[0].code;
    try {
      return parsePhoneNumber(countryCode + shopInfo.value.phoneNumber);
    } catch (__error) {
      return null;
    }
  });

  const nationalPhoneNumber = computed(() => {
    const pnumber = parsedNumber.value;
    if (pnumber) {
      return formatNational(pnumber);
    }
    return shopInfo.value.phoneNumber;
  });

  return {
    parsedNumber,
    nationalPhoneNumber,
  };
};
// 呼び手が渡す id は、まだ保存されていない品目では無い。
// 無いまま getElementById に渡しても何も見つからないので、先に返す。
export const scrollToElementById = (id: string | undefined) => {
  if (id === undefined) {
    return;
  }
  const elem = document.getElementById(id);
  if (elem) {
    scrollTo(0, elem.getBoundingClientRect().y + window.pageYOffset);
  }
};

export const useNationalPhoneNumber = (shopInfo: RestaurantInfoData) => {
  // BUGBUG: We need to determine what we want to diplay for EU
  const parsedNumber = computed(() => {
    const countryCode =
      shopInfo.countryCode || stripe_regions_jp.countries[0].code;
    try {
      return parsePhoneNumber(countryCode + shopInfo.phoneNumber);
    } catch (__error) {
      return null;
    }
  });
  const nationalPhoneNumber = computed(() => {
    if (!shopInfo.phoneNumber) {
      return "";
    }
    if (parsedNumber.value) {
      return formatNational(parsedNumber.value);
    }
    console.log("parsing failed, return as-is");
    // return shopInfo.phoneNumber;
    return "";
  });
  return {
    parsedNumber,
    nationalPhoneNumber,
  };
};

// 型を `true` のまま留める。広がって `boolean` になると、画面側で
// 「権限が無いときの形」として宣言した型に代入できなくなる。
export const notFoundResponse: { notFound: true } = {
  notFound: true,
};

// 画面から離れることが決まった setup が返すもの。`return;` にすると setup の戻り型が
// undefined との union になり、template がその画面の値を一つも読めなくなる。
export const redirectedResponse: Record<string, never> = {};

const setImageFallbackSrc = (e: Event, src: string) => {
  if (e.target instanceof HTMLImageElement) {
    e.target.src = src;
  }
};
export const smallImageErrorHandler = (e: Event) => {
  setImageFallbackSrc(e, "/images/noimage_small.png");
};
export const imageErrorHandler = (e: Event) => {
  setImageFallbackSrc(e, "/images/noimage.png");
};

export const orderType = (order: OrderInfoData) => {
  if (order.isEC) {
    return "EC";
  }
  if (order.isDelivery) {
    return "Delivery";
  }
  return "Takeout";
};
export const orderTypeKey = (order: OrderInfoData) => {
  return "orderType" + orderType(order);
};

export const isDev = firebaseConfig.projectId === "ownplate-dev";

export const useIsLocaleJapan = () => {
  // for hack
  const { locale } = useI18n();
  console.log(locale.value);
  return computed(() => {
    return locale.value !== "en" && locale.value !== "fr";
  });
};

export const useFeatureHeroMobile = () => {
  const isLocaleJapan = useIsLocaleJapan();

  return computed(() => {
    return regionalSetting.FeatureHeroMobile[isLocaleJapan.value ? "ja" : "en"];
  });
};
export const useFeatureHeroTablet = () => {
  const isLocaleJapan = useIsLocaleJapan();
  return computed(() => {
    return regionalSetting.FeatureHeroTablet[isLocaleJapan.value ? "ja" : "en"];
  });
};
export const useIsNotSuperAdmin = () => {
  const userStore = useUserStore();
  const isNotSuperAdmin = computed(() => {
    return userStore.isNotSuperAdmin;
  });
  const isNotOperator = computed(() => {
    return userStore.isNotOperator;
  });
  return {
    isNotSuperAdmin,
    isNotOperator,
  };
};

// https://developers-jp.googleblog.com/2019/12/how-calculate-distances-map-maps-javascript-api.html
export const haversine_distance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) => {
  const R = 6371.071;
  const rlat1 = lat1 * (Math.PI / 180);
  const rlat2 = lat2 * (Math.PI / 180);
  const difflat = rlat2 - rlat1;
  const difflon = (lng2 - lng1) * (Math.PI / 180);

  const d =
    2 *
    R *
    Math.asin(
      Math.sqrt(
        Math.sin(difflat / 2) * Math.sin(difflat / 2) +
          Math.cos(rlat1) *
            Math.cos(rlat2) *
            Math.sin(difflon / 2) *
            Math.sin(difflon / 2),
      ),
    );
  return Math.round(d * 1000);
};

export const useSuper = () => {
  const userStore = useUserStore();
  const router = useRouter();

  onMounted(() => {
    if (!userStore.user || userStore.isNotSuperAdmin) {
      router.push("/");
    }
  });
};

export const orderFilter = (order: OrderInfoData) => {
  const excludeStatuses: number[] = [
    order_status.transaction_hide,
    order_status.waiting_payment,
  ];
  return !excludeStatuses.includes(order.status);
};

// for super
export const isSuperPage = () => {
  return location.pathname.startsWith("/s/");
};
export const getBackUrl = () => {
  return isSuperPage() ? "/s" : "/op";
};

export const superPermissionCheck = () => {
  const userStore = useUserStore();
  const router = useRouter();
  if (isSuperPage()) {
    if (!userStore.user || userStore.isNotSuperAdmin) {
      router.push("/");
    }
  } else if (
    !userStore.user ||
    (userStore.isNotSuperAdmin && userStore.isNotOperator)
  ) {
    router.push("/");
  }
};
