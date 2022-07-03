import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc } from "firebase/firestore";

import { ShopOwnerData, PartnerData } from "@/models/ShopOwner";
import { OrderInfoData, OrderItem } from "@/models/orderInfo";
import { MenuData } from "@/models/menu";
import { RestaurantInfoData } from "@/models/RestaurantInfo";

import { regionalSettings, partners } from "@/config/constant";
import { ownPlateConfig, mo_prefixes } from "@/config/project";

import { computed } from "@vue/composition-api";

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

/* 
    resizedProfileImage(restaurant, size) {
      return (
        (restaurant.images?.profile?.resizedImages || {})[size] ||
        restaurant.restProfilePhoto
      );
    },
*/
export const arrayChunk = <T>(arr: T[], size = 1) => {
  const array = [...arr];
  return array.reduce((current: T[][], value: T, index: number) => {
    return index % size
      ? current
      : [...current, array.slice(index, index + size)];
  }, []);
};
/*
    shareUrl() {
      return (
        location.protocol + "//" + location.host + "/r/" + this.restaurantId()
      );
      // return "https://omochikaeri.com/r/" + this.restaurantId();
    },
*/
export const doc2data = (dataType: string) => {
  return (doc: any) => {
    const data = doc.data();
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
/*
    num2time(num) {
      if (num === 0 || num === 60 * 24) {
        return this.$t("shopInfo.midnight");
      }
      if (num === 60 * 12) {
        return this.$t("shopInfo.noon");
      }
      const offsetTime = this.$i18n.locale == "ja" ? 12 : 13;
      const isPm = num >= 60 * 12;
      if (num >= 60 * offsetTime) {
        num = num - 60 * 12;
      }
      const formatedTime = [
        String(Math.floor(num / 60)).padStart(2, "0"),
        ":",
        String(num % 60).padStart(2, "0"),
        " ",
      ].join("");

      if (isPm) {
        return this.$tc("shopInfo.pm", 1, { formatedTime });
      }
      return this.$tc("shopInfo.am", 0, { formatedTime });
    },
    countObj(obj) {
      if (Array.isArray(obj)) {
        return obj.reduce((tmp, value) => {
          // nested array
          if (Array.isArray(value)) {
            return tmp + this.countObj(value);
          }
          return tmp + 1;
        }, 0);
      }
      return Object.keys(obj).reduce((tmp, key) => {
        return this.countObj(obj[key]) + tmp;
      }, 0);
    },
*/

export const cleanObject = (obj: { [key: string]: any }) => {
  return Object.keys(obj).reduce((tmp: { [key: string]: any }, key) => {
    if (!isNull(obj[key])) {
      tmp[key] = obj[key];
    }
    return tmp;
  }, {});
};

/*
    copyClipboard: async function (text) {
      // TODO: check no-nuxt branch
      try {
        await this.$copyText(text);
        this.$buefy.toast.open(this.i18n.tc("shopInfo.UrlCopied"));
      } catch (e) {
        this.$buefy.toast.open(this.i18n.tc("shopInfo.UrlCopyFailed"));
      }
    },
    forcedError(key) {
      const debug = this.$route.query.error;
      return debug === key ? "---forced-error---" : "";
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
    getSoundIndex(nameKey) {
      if (nameKey) {
        const index = soundFiles.findIndex((data) => data.nameKey === nameKey);
        return index >= 0 ? index : 0;
      }
      return 0;
    },
*/
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

/*
    forceArray(arr) {
      return Array.isArray(arr) ? arr : [arr];
    },
    convOrderStateForText(orderState, orderInfo) {
      if (orderInfo?.isEC) {
        if (orderState === "ready_to_pickup") {
          return "ready_to_shipping";
        }
        if (orderState === "transaction_complete") {
          return "shipping_complete";
        }
      }
      return orderState;
      },
*/

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

const itemOptionCheckbox2options = (itemOptionCheckbox: any) => {
  // HACK: Dealing with a special case (probalby a bug in the menu editor)
  if (
    itemOptionCheckbox &&
    itemOptionCheckbox.length === 1 &&
    !itemOptionCheckbox[0]
  ) {
    console.log("Special case: itemOptionCheckbox===['']");
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

const roundPrice = (price) => {
  const m = this.$store.getters.stripeRegion.multiple;
  return Math.round(price * m) / m;
};
*/

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
// "" or "/mo" or "/liff/hoge"
export const useBasePath = (root: any) => {
  const isInLiff = useIsInLiff(root);
  const isInMo = useIsInMo(root);

  return computed(() => {
    if (isInMo.value) {
      return "/" + getMoPrefix(root);
    }
    if (isInLiff.value) {
      return "/" + root.$route.params.liffIndexId;
    }
    return "";
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

export const subtotal2total = (
  subTotal: { [key: string]: number },
  cartItems: { [key: string]: MenuData },
  shopInfo: RestaurantInfoData
) => {
  return Object.keys(subTotal).reduce((tmp, menuId) => {
    const menu = cartItems[menuId] || {};

    if (!shopInfo.inclusiveTax) {
      if (menu.tax === "alcohol") {
        return (1 + shopInfo.alcoholTax * 0.01) * subTotal[menuId] + tmp;
      }
      return (1 + shopInfo.foodTax * 0.01) * subTotal[menuId] + tmp;
    } else {
      return tmp + subTotal[menuId];
    }
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
}
