import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc } from "firebase/firestore";

import { ShopOwnerData, PartnerData } from "@/models/ShopOwner";
import { OrderInfoData, OrderItem } from "@/models/orderInfo";
import { MenuData } from "@/models/menu";

import { regionalSettings, partners } from "@/config/constant";
import { ownPlateConfig } from "@/config/project";

export const isNull = <T>(value: T) => {
  return value === null || value === undefined;
};

export const isEmpty = <T>(value: T) => {
  return value === null || value === undefined || String(value) === "";
};

// from mixin
/* 
    restaurantId() {
      return this.$route.params.restaurantId;
    },
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

export const itemOptionCheckbox2options = (itemOptionCheckbox: any) => {
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
export const taxRate = (shopInfo: any, item: any) => {
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

export const optionPrice = (option: string) => {
  const regex = /\(((\+|\-|＋|ー|−)[0-9\.]+)\)/;
  const match = (option || "").match(regex);
  if (match) {
    return Number(match[1].replace(/ー|−/g, "-").replace(/＋/g, "+"));
  }
  return 0;
};
