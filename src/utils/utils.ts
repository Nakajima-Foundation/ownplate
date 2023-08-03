import { ref, computed, onMounted } from "vue";
import firebase from "firebase/app";
import { db } from "@/lib/firebase/firebase9";
import {
  DocumentData,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";

import { ShopOwnerData, PartnerData } from "@/models/ShopOwner";
import { OrderInfoData, OrderItemData } from "@/models/orderInfo";
import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { MenuData } from "@/models/menu";

import {
  regionalSettings,
  partners,
  stripe_regions,
  soundFiles,
} from "@/config/constant";
import { firebaseConfig, ownPlateConfig, mo_prefixes } from "@/config/project";

import { defaultHeader } from "@/config/header";

import { formatOption } from "@/utils/strings";
import { parsePhoneNumber, formatNational } from "@/utils/phoneutil";
import isURL from "validator/lib/isURL";
import isLatLong from "validator/lib/isLatLong";

import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";

export const isNull = <T>(value: T) => {
  return value === null || value === undefined;
};

export const isEmpty = <T>(value: T) => {
  return value === null || value === undefined || String(value) === "";
};

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

export const resizedProfileImage = (
  restaurant: RestaurantInfoData,
  size: string
) => {
  return (
    (restaurant.images?.profile?.resizedImages || {})[size] ||
    restaurant.restProfilePhoto
  );
};

export const arrayChunk = <T>(arr: T[], size = 1) => {
  const array = [...arr];
  return array.reduce((current: T[][], value: T, index: number) => {
    return index % size
      ? current
      : [...current, array.slice(index, index + size)];
  }, []);
};

export const shareUrlAdmin = (props: any) => {
  const link = previewLink(props);
  return computed(() => {
    return location.protocol + "//" + location.host + link.value;
  });
};
export const previewLink = (props: any) => {
  return computed(() => {
    if (props.isInMo) {
      return "/" + props.moPrefix + "/r/" + props.shopInfo.restaurantId;
    } else {
      return "/r/" + props.shopInfo.restaurantId;
    }
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
  return (doc: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>): T => {
    const data = doc.data() || ({} as DocumentData);
    data.id = doc.id;
    data._dataType = dataType;
    return data as T;
  };
};

export const array2obj = <T>(array: T[]) => {
  return array.reduce((tmp: { [key: string]: T }, current: T) => {
    tmp[(current as any).id] = current;
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
    " ",
  ].join("");
};

export const num2time = (num: number) => {
  const { locale, t } = useI18n({ useScope: 'global' });
  
  if (num === 0 || num === 60 * 24) {
    return t("shopInfo.midnight");
  }
  if (num === 60 * 12) {
    return t("shopInfo.noon");
  }
  const offsetTime = locale.value == "ja" ? 12 : 13;
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

export const countObj = (obj: any): number => {
  if (Array.isArray(obj)) {
    return obj.reduce((tmp, value) => {
      // nested array
      if (Array.isArray(value)) {
        return tmp + countObj(value);
      }
      return tmp + 1;
    }, 0);
  }
  return Object.keys(obj).reduce((tmp, key) => {
    return countObj(obj[key]) + tmp;
  }, 0);
};

export const cleanObject = (obj: { [key: string]: any }) => {
  return Object.keys(obj).reduce((tmp: { [key: string]: any }, key) => {
    if (!isNull(obj[key])) {
      tmp[key] = obj[key];
    }
    return tmp;
  }, {});
};

/*
    },
    moment(value) {
      return moment(value);
      },
*/

export const useSoundPlay = () => {
  const store = useStore();
  return (reason?: string) => {
    store.commit("pingOrderEvent");
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

export const getShopOwner = async (uid: string): Promise<ShopOwnerData> => {
  const defaultData = { hidePrivacy: false };
  const admin = (await getDoc(doc(db, `/admins/${uid}`))).data();
  if (admin) {
    return admin as ShopOwnerData;
  }
  return defaultData;
};
export const arraySum = (arr: number[]) => {
  return Object.values(arr || [0]).reduce(
    (accumulator, currentValue) => accumulator + currentValue
  );
};
export const arrayOrNumSum = (arr: number | number[]) => {
  return Array.isArray(arr) ? arraySum(arr) : arr || 0;
};

export const forceArray = <T>(arr: T) => {
  return Array.isArray(arr) ? arr : [arr];
};

export const convOrderStateForText = (orderState: string, orderInfo: any) => {
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
  menuObj: { [key: string]: MenuData }
) => {
  if (orderInfo.order && orderInfo.menuItems) {
    return Object.keys(orderInfo.order).reduce((tmp: OrderItemData[], menuId) => {
      const numArray = Array.isArray(orderInfo.order[menuId])
        ? orderInfo.order[menuId]
        : [orderInfo.order[menuId]];
      const opt =
        orderInfo.options && orderInfo.options[menuId]
          ? orderInfo.options[menuId]
          : null;
      const optArray = Array.isArray(orderInfo.order[menuId])
        ? orderInfo.options[menuId]
        : [orderInfo.options[menuId]];
      Object.keys(numArray).map((numKey: string) => {
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
    }, []);
  }
  return [];
};

export const itemOptionCheckbox2options = (itemOptionCheckbox: any): string[] => {
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
export const taxRate = (shopInfo: RestaurantInfoData, item: MenuData) => {
  if (shopInfo.inclusiveTax) {
    return 1;
  }
  if (item.tax === "alcohol") {
    return 1 + shopInfo.alcoholTax * 0.01;
  }
  return 1 + shopInfo.foodTax * 0.01;
};

export const priceWithTax = (shopInfo: RestaurantInfoData, menu: MenuData) => {
  return Math.round(
    (() => {
      if (shopInfo.inclusiveTax) {
        return menu.price;
      }
      if (menu.tax === "alcohol") {
        return (1 + shopInfo.alcoholTax * 0.01) * menu.price;
      }
      return (1 + shopInfo.foodTax * 0.01) * menu.price;
    })()
  );
};

export const getPartner = (shopOwner: ShopOwnerData) => {
  return ((shopOwner || {}).partners || []).map((p: string) => {
    const match = partners.find((a: PartnerData) => {
      return a.id === p;
    });
    return match;
  });
};

export const sha256 = async (str: string) =>  {
  const buff = new Uint8Array(str.split("").map((c: string) => c.charCodeAt(0))).buffer;
  const digest = await crypto.subtle.digest('SHA-256', buff);
  return [...(new Uint8Array(digest))].map((x: number) => ('00' + x.toString(16)).slice(-2)).join('');
 }


export const regionalSetting = (regionalSettings as { [key: string]: any })[
  ownPlateConfig.region || "US"
];

export const stripeRegion = stripe_regions[ownPlateConfig.region || "US"];

export const isLineEnabled = !!ownPlateConfig.line;

export const roundPrice = (price: number) => {
  const m = stripeRegion.multiple;
  return Math.round(price * m) / m;
};

export const displayOption = (option: string, shopInfo: RestaurantInfoData, item: MenuData) => {
  const { n } = useI18n({ useScope: 'global' });
  return formatOption(option, (price) => {
    return n(
      roundPrice(price * taxRate(shopInfo, item)),
      "currency"
    );
  });
};

const optionPrice = (option: string) => {
  const regex = /\(((\+|\-|＋|ー|−)[0-9\.]+)\)/;
  const match = (option || "").match(regex);
  if (match) {
    return Number(match[1].replace(/ー|−/g, "-").replace(/＋/g, "+"));
  }
  return 0;
};
export const useIsInMo = () => {
  const route = useRoute();

  return computed(() => {
    if (location.pathname !== route.path) {
      return null;
    }
    return mo_prefixes.some((prefix) => {
      return (
        (route.fullPath || "").startsWith(`/${prefix}/`) ||
        (route.fullPath || "") === `/${prefix}`
      );
    });
  });
};
const useIsInLiff = () => {
  const route = useRoute();

  return computed(() => {
    return (route.fullPath || "").startsWith(`/liff/`);
  });
};
export const getMoPrefix = () => {
  const route = useRoute();
  return mo_prefixes.find((prefix) => {
    return (
      (route.fullPath || "").startsWith(`/${prefix}/`) ||
      (route.fullPath || "") === `/${prefix}`
    );
  });
};
export const useMoPrefix = () => {
  const route = useRoute();
  return computed(() => {
    return mo_prefixes.find((prefix) => {
      return (
        (route.fullPath || "").startsWith(`/${prefix}/`) ||
          (route.fullPath || "") === `/${prefix}`
      );
    });
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
  const isInMo = useIsInMo();

  return computed(() => {
    if (isInMo.value) {
      return "mo";
    }
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
  const isInMo = useIsInMo();
  const moPrefix = useMoPrefix();

  return computed(() => {
    if (isInMo.value) {
      return "/" + moPrefix.value;
    }
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
  const isInMo = useIsInMo();
  const moPrefix = useMoPrefix();

  return computed(() => {
    if (isInMo.value) {
      return "/" + moPrefix.value;
    }
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
  return Object.keys(obj).reduce(
    (newObj: { [key: string]: { [key: string]: T } }, objKey: string) => {
      newObj[objKey] = obj[objKey].reduce(
        (tmp: { [key: string]: T }, value: T, key: number) => {
          tmp[key] = value;
          return tmp;
        },
        {}
      );
      return newObj;
    },
    {}
  );
};

export const prices2subtotal = (prices: { [key: string]: number[] }) => {
  return Object.keys(prices).reduce(
    (tmp: { [key: string]: number }, menuId) => {
      tmp[menuId] = prices[menuId].reduce((a, b) => a + b, 0);
      return tmp;
    },
    {}
  );
};

export const getPriceWithTax = (
  subTotal: number,
  menu: MenuData,
  shopInfo: RestaurantInfoData
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
  cartItems: { [key: string]: MenuData },
  shopInfo: RestaurantInfoData
) => {
  return Object.keys(subTotal).reduce((tmp, menuId) => {
    const menu = cartItems[menuId] || {};
    return tmp + getPriceWithTax(subTotal[menuId], menu, shopInfo);
  }, 0);
};

export const getPrices = (
  multiple: number,
  orders: { [key: string]: number[] },
  cartItems: { [key: string]: MenuData },
  trimmedSelectedOptions: { [key: string]: { [key: string]: number[] } }
) => {
  const ret: any = {};

  Object.keys(orders).map((menuId) => {
    const menu = cartItems[menuId] || {};
    ret[menuId] = [];
    orders[menuId].map((num, orderKey) => {
      const selectedOptionsRaw = trimmedSelectedOptions[menuId][orderKey] || [];
      const price = selectedOptionsRaw.reduce(
        (tmpPrice: number, selectedOpt, key) => {
          const opt = (menu.itemOptionCheckbox[key] || "").split(",");
          if (opt.length === 1) {
            if (selectedOpt) {
              return (
                tmpPrice + Math.round(optionPrice(opt[0]) * multiple) / multiple
              );
            }
          } else {
            return (
              tmpPrice +
              Math.round(optionPrice(opt[selectedOpt]) * multiple) / multiple
            );
          }
          return tmpPrice;
        },
        menu.price
      );
      ret[menuId].push(price * num);
    });
  });
  return ret;
};

export const getTrimmedSelectedOptions = (
  orders: { [key: string]: number[] },
  cartItems: { [key: string]: MenuData },
  selectedOptions: { [key: string]: any }
) => {
  return Object.keys(orders).reduce(
    (ret: { [key: string]: { [key: string]: number[] } }, id) => {
      const options = itemOptionCheckbox2options(
        (cartItems[id] || {}).itemOptionCheckbox
      );
      const selectedOption = selectedOptions[id].map((selected: any[]) => {
        if (Array.isArray(selected) && selected.length > options.length) {
          const newopt = [...selected];
          return newopt.slice(0, options.length);
        }
        return selected;
      });
      ret[id] = selectedOption;
      return ret;
    },
    {}
  );
};

export const getPostOption = (
  trimmedSelectedOptions: { [key: string]: any[][] },
  cartItems: { [key: string]: MenuData }
) => {
  return Object.keys(trimmedSelectedOptions).reduce(
    (ret: { [key: string]: any }, id) => {
      ret[id] = (trimmedSelectedOptions[id] || []).map((item, k) => {
        return item
          .map((selectedOpt: any, key) => {
            const opt = (cartItems[id] || {}).itemOptionCheckbox[key].split(
              ","
            );
            if (opt.length === 1) {
              if (selectedOpt) {
                return opt[0];
              }
            } else {
              return opt[selectedOpt];
            }
            return "";
          })
          .map((s) => s.trim());
      });
      return ret;
    },
    {}
  );
};

export const useUserData = () => {
  const store = useStore();
  const route = useRoute();

  const isAdmin = computed(() => {
    return !!store.getters.uidAdmin;
  });
  const uid = computed(() => {
    return store.getters.uid;
  });
  const isUser = computed(() => {
    return !!store.getters.uidUser;
  });

  const isLiffUser = computed(() => {
    return !!store.getters.uidLiff;
  });
  const isLineUser = computed(() => {
    const claims = store.state.claims;
    return !!claims?.line;
  });
  const claims = computed(() => {
    return store.state.claims;
  });
  const inLiff = computed(() => {
    return !!route.params.liffIndexId;
  });
  const user = computed(() => {
    return store.state.user;
  });

  const isAnonymous = computed(() => {
    return store.getters.isAnonymous;
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

// do not use
export const useUser = () => {
  const store = useStore();
  const user = computed(() => {
    return store.state.user;
  });
  return user;
};

export const isJapan = ownPlateConfig.region === "JP";
export const serviceKey = isJapan ? "omochikaeri" : "ownPlate";

export const underConstruction =
  ownPlateConfig.hostName === "staging.ownplate.today";

export const defaultTitle = defaultHeader.title;

export const useAdminUids = () => {
  const store = useStore();

  const isOwner = computed(() => {
    return !store.getters.isSubAccount;
  });
  const uid = computed(() => {
    return store.getters.uidAdmin;
  });
  const ownerUid = computed(() => {
    return store.getters.isSubAccount
      ? store.getters.parentId
      : store.getters.uidAdmin;
  });
  const emailVerified = computed(() => {
    return store.state.user?.emailVerified;
  });
  return {
    isOwner,
    uid,
    ownerUid,
    emailVerified,
  };
};

export const usePhoneNumber = (shopInfo: any) => {
  const countries = stripeRegion.countries;

  const parsedNumber = computed(() => {
    const countryCode = shopInfo.value.countryCode || countries.value[0].code;
    try {
      return parsePhoneNumber(countryCode + shopInfo.value.phoneNumber);
    } catch (error) {
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
export const scrollToElementById = (id: string) => {
  const elem = document.getElementById(id);
  if (elem) {
    scrollTo(0, elem.getBoundingClientRect().y + window.pageYOffset);
  }
};

export const useNationalPhoneNumber = (shopInfo: RestaurantInfoData) => {
  // BUGBUG: We need to determine what we want to diplay for EU
  const parsedNumber = computed(() => {
    const countryCode = shopInfo.countryCode || stripeRegion.countries[0].code;
    try {
      return parsePhoneNumber(countryCode + shopInfo.phoneNumber);
    } catch (error) {
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

export const notFoundResponse = {
  notFound: true,
};

export const smallImageErrorHandler = (e: any) => {
  e.target.src = "/images/noimage_small.png";
};
export const imageErrorHandler = (e: any) => {
  e.target.src = "/images/noimage.png";
};

export const orderType = (order: OrderInfoData, isInMo: boolean) => {
  if (order.isEC) {
    return "EC";
  }
  if (order.isDelivery) {
    return "Delivery";
  }
  if (order.isPickup) {
    return "Pickup";
  }
  if (isInMo) {
    return "PreOrder";
  }
  return "Takeout";
};
export const orderTypeKey = (order: OrderInfoData, isInMo: boolean) => {
  return "orderType" + orderType(order, isInMo);
};

export const isDev = firebaseConfig.projectId === "ownplate-dev";

export const useIsLocaleJapan = () => {
  // for hack
  const { locale } = useI18n({ useScope: 'global' });
  console.log(locale.value);
  return computed(() => {
    return locale.value !== "en" && locale.value !== "fr";
  });
};

export const useFeatureHeroMobile = () => {
  const isLocaleJapan = useIsLocaleJapan();
  
  return computed(() => {
    return regionalSetting.FeatureHeroMobile[
      isLocaleJapan.value ? "ja" : "en"
    ];
  });
};
export const useFeatureHeroTablet = () => {
  const isLocaleJapan = useIsLocaleJapan();
  return computed(() => {
    return regionalSetting.FeatureHeroTablet[
      isLocaleJapan.value ? "ja" : "en"
    ];
  });
};
export const useIsNotSuperAdmin = () => {
  const store = useStore();
  const isNotSuperAdmin = computed(() => {
    return store.getters.isNotSuperAdmin;
  });
  const isNotOperator = computed(() => {
    return store.getters.isNotOperator;
  });
  return {
    isNotSuperAdmin,
    isNotOperator,
  };
}

// https://developers-jp.googleblog.com/2019/12/how-calculate-distances-map-maps-javascript-api.html
export const haversine_distance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
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
              Math.sin(difflon / 2)
          )
        );
  return Math.round(d * 1000);
};

export const useSuper = () => {
  const store = useStore();
  const router = useRouter();

  onMounted(() => {
    if (!store.state.user || store.getters.isNotSuperAdmin) {
      router.push("/");
    }
  });
};

// for super
export const isSuperPage = () => {
  return location.pathname.startsWith("/s/");
};
export const getBackUrl = () => {
  return isSuperPage() ? "/s" : "/op";
};

export const superPermissionCheck = () => {
  const store = useStore();
  const router = useRouter();
  if (isSuperPage()) {
    if (!store.state.user || store.getters.isNotSuperAdmin) {
      router.push("/");
    }
  } else {
    if (
      !store.state.user ||
        (store.getters.isNotSuperAdmin &&
          store.getters.isNotOperator)
    ) {
      router.push("/");
    }
  }
};

