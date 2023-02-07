import { ref, computed } from "@vue/composition-api";
import firebase from "firebase/app";
import { db } from "@/lib/firebase/firebase9";
import {
  DocumentData,
  DocumentSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";

import { ShopOwnerData, PartnerData } from "@/models/ShopOwner";
import { OrderInfoData, OrderItem } from "@/models/orderInfo";
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

import { parsePhoneNumber, formatNational } from "@/utils/phoneutil";
import isURL from "validator/lib/isURL";
import isLatLong from "validator/lib/isLatLong";

export const isNull = <T>(value: T) => {
  return value === null || value === undefined;
};

export const isEmpty = <T>(value: T) => {
  return value === null || value === undefined || String(value) === "";
};

// from mixin
export const useRestaurantId = (root: any) => {
  return computed(() => {
    return root.$route.params.restaurantId;
  });
};

export const getRestaurantId = (root: any) => {
  return root.$route.params.restaurantId;
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

export const shareUrl = (root: any, prefix: string) => {
  const restaurantId = root.$route.params.restaurantId;

  return (
    location.protocol + "//" + location.host + prefix + "/r/" + restaurantId
  );
};

export const doc2data = (dataType: string) => {
  return (doc: DocumentSnapshot<DocumentData>): DocumentData => {
    const data = doc.data() || ({} as DocumentData);
    data.id = doc.id;
    data._dataType = dataType;
    return data;
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

export const num2time = (num: number, root: any) => {
  if (num === 0 || num === 60 * 24) {
    return root.$t("shopInfo.midnight");
  }
  if (num === 60 * 12) {
    return root.$t("shopInfo.noon");
  }
  const offsetTime = root.$i18n.locale == "ja" ? 12 : 13;
  const isPm = num >= 60 * 12;
  if (num >= 60 * offsetTime) {
    num = num - 60 * 12;
  }
  const formatedTime = num2simpleFormatedTime(num);

  if (isPm) {
    return root.$tc("shopInfo.pm", 1, { formatedTime });
  }
  return root.$tc("shopInfo.am", 0, { formatedTime });
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
    soundPlay(reason) {
      this.$store.commit("pingOrderEvent");
      if (reason) {
        console.log("order: call play: " + reason);
      } else {
        console.log("order: call play");
      }
    },
*/
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
    return Object.keys(orderInfo.order).reduce((tmp: OrderItem[], menuId) => {
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

export const itemOptionCheckbox2options = (itemOptionCheckbox: any) => {
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
/*
const displayOption = (option, shopInfo, item) => {
  return formatOption(option, (price) => {
    return this.$n(
      this.roundPrice(price * this.taxRate(shopInfo, item)),
      "currency"
    );
  });
};

*/

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

export const regionalSetting = (regionalSettings as { [key: string]: any })[
  ownPlateConfig.region || "US"
];

export const stripeRegion = stripe_regions[ownPlateConfig.region || "US"];

export const roundPrice = (price: number) => {
  const m = stripeRegion.multiple;
  return Math.round(price * m) / m;
};

const optionPrice = (option: string) => {
  const regex = /\(((\+|\-|＋|ー|−)[0-9\.]+)\)/;
  const match = (option || "").match(regex);
  if (match) {
    return Number(match[1].replace(/ー|−/g, "-").replace(/＋/g, "+"));
  }
  return 0;
};
export const useIsInMo = (root: any) => {
  return computed(() => {
    if (location.pathname !== root.$route.path) {
      return null;
    }
    return mo_prefixes.some((prefix) => {
      return (
        (root.$route.fullPath || "").startsWith(`/${prefix}/`) ||
        (root.$route.fullPath || "") === `/${prefix}`
      );
    });
  });
};
export const useIsInLiff = (root: any) => {
  return computed(() => {
    return (root.$route.fullPath || "").startsWith(`/liff/`);
  });
};
export const getMoPrefix = (root: any) => {
  return mo_prefixes.find((prefix) => {
    return (
      (root.$route.fullPath || "").startsWith(`/${prefix}/`) ||
      (root.$route.fullPath || "") === `/${prefix}`
    );
  });
};
export const useMoPrefix = (root: any) => {
  return computed(() => {
    return getMoPrefix(root);
  });
};
export const useLiffIndexId = (root: any) => {
  return computed(() => {
    return root.$route.params.liffIndexId;
  });
};
export const useLiffBasePath = (root: any) => {
  const liffIndexId = useLiffIndexId(root);
  return computed(() => {
    return `/liff/${liffIndexId.value}`;
  });
};

export const routeMode = (root: any) => {
  const isInLiff = useIsInLiff(root);
  const isInMo = useIsInMo(root);

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
export const useBasePath = (root: any) => {
  const isInLiff = useIsInLiff(root);
  const liffBasePath = useLiffBasePath(root);
  const isInMo = useIsInMo(root);
  const moPrefix = useMoPrefix(root);

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
export const useTopPath = (root: any) => {
  const inLiff = useIsInLiff(root);
  const liffBasePath = useLiffBasePath(root);
  const isInMo = useIsInMo(root);
  const moPrefix = useMoPrefix(root);

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

export const validLocation = (location: { lat: string; lng: string }) => {
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

export const useIsAdmin = (ctx: any) => {
  return computed(() => {
    return !!ctx.root.$store.getters.uidAdmin;
  });
};
export const useUid = (ctx: any) => {
  const uid = computed(() => {
    return ctx.root.$store.getters.uid;
  });
  return uid;
};

export const useIsLiffUser = (ctx: any) => {
  return computed(() => {
    return !!ctx.root.$store.getters.uidLiff;
  });
};
export const useIsLineUser = (ctx: any) => {
  return computed(() => {
    const claims = ctx.root.$store.state.claims;
    return !!claims?.line;
  });
};

export const useInLiff = (ctx: any) => {
  return computed(() => {
    // BY path
    return !!ctx.root.$route.params.liffIndexId;
  });
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

export const useUser = (ctx: any) => {
  const user = computed(() => {
    return ctx.root.$store.state.user;
  });
  return user;
};

export const isJapan = ownPlateConfig.region === "JP";
export const serviceKey = isJapan ? "omochikaeri" : "ownPlate";

export const underConstruction =
  ownPlateConfig.hostName === "staging.ownplate.today";

export const defaultTitle = defaultHeader.title;

export const useAdminUids = (ctx: any) => {
  const isOwner = computed(() => {
    return !ctx.root.$store.getters.isSubAccount;
  });
  const uid = computed(() => {
    return ctx.root.$store.getters.uidAdmin;
  });
  const ownerUid = computed(() => {
    return ctx.root.$store.getters.isSubAccount
      ? ctx.root.$store.getters.parentId
      : ctx.root.$store.getters.uidAdmin;
  });
  const emailVerified = computed(() => {
    return ctx.root.$store.state.user?.emailVerified;
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
