import Vue from "vue";
import { db } from "@/plugins/firebase";
import { firebaseConfig, ownPlateConfig } from "@/config/project";
import { soundFiles, regionalSettings } from "@/config/constant";
import moment from "moment";
import * as Cookie from "cookie";

import { defaultHeader } from "@/config/header";
import { formatOption } from "@/utils/strings";

import { arraySum } from "@/utils/utils";
import { GAPIKey } from "@/config/project";

const mixin = {
  methods: {
    isNull(value) {
      return value === null || value === undefined;
    },
    restaurantId() {
      return this.$route.params.restaurantId;
    },
    resizedProfileImage(restaurant, size) {
      return (
        (restaurant.images?.profile?.resizedImages || {})[size] ||
        restaurant.restProfilePhoto
      );
    },
    shareUrl() {
      return (
        location.protocol + "//" + location.host + "/r/" + this.restaurantId()
      );
      // return "https://omochikaeri.com/r/" + this.restaurantId();
    },
    doc2data(dataType) {
      return (doc) => {
        const data = doc.data();
        data.id = doc.id;
        data._dataType = dataType;
        return data;
      };
    },
    array2obj(array) {
      return array.reduce((tmp, current) => {
        tmp[current.id] = current;
        return tmp;
      }, {});
    },
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
    copyClipboard: async function (text) {
      // TODO: check no-nuxt branch
      try {
        await this.$copyText(text);
        this.$buefy.toast.open(this.$i18n.tc("shopInfo.UrlCopied"));
      } catch (e) {
        this.$buefy.toast.open(this.$i18n.tc("shopInfo.UrlCopyFailed"));
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
    arrayOrNumSum(arr) {
      return Array.isArray(arr) ? arraySum(arr) : arr || 0;
    },
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
    itemOptionCheckbox2options(itemOptionCheckbox) {
      // HACK: Dealing with a special case (probalby a bug in the menu editor)
      if (
        itemOptionCheckbox &&
        itemOptionCheckbox.length === 1 &&
        !itemOptionCheckbox[0]
      ) {
        console.log("Special case: itemOptionCheckbox===['']");
        return [];
      }
      return (itemOptionCheckbox || []).map((option) => {
        return option.split(",").map((choice) => {
          return choice.trim();
        });
      });
    },
    taxRate(shopInfo, item) {
      if (shopInfo.inclusiveTax) {
        return 1;
      }
      if (item.tax === "alcohol") {
        return 1 + shopInfo.alcoholTax * 0.01;
      }
      return 1 + shopInfo.foodTax * 0.01;
    },
    displayOption(option, shopInfo, item) {
      return formatOption(option, (price) => {
        return this.$n(
          this.roundPrice(price * this.taxRate(shopInfo, item)),
          "currency"
        );
      });
    },
    roundPrice(price) {
      const m = this.$store.getters.stripeRegion.multiple;
      return Math.round(price * m) / m;
    },
  },
  computed: {
    underConstruction() {
      return ownPlateConfig.hostName === "staging.ownplate.today";
    },
    defaultTitle() {
      return defaultHeader.title;
    },
    regionalSetting() {
      return regionalSettings[ownPlateConfig.region || "US"];
    },
    user() {
      return this.$store.state.user;
    },
    isAdmin() {
      return !!this.$store.getters.uidAdmin;
    },
    isCustomer() {
      return !!this.$store.getters.uidUser;
    },
    isLiffUser() {
      return !!this.$store.getters.uidLiff;
    },
    userLiffId() {
      return this.$store.getters.liffId;
    },
    isAnonymous() {
      return this.$store.getters.isAnonymous;
    },
    isLineUser() {
      const claims = this.$store.state.claims;
      return !!claims?.line;
    },
    isLineEnabled() {
      return !!ownPlateConfig.line;
    },
    isJapan() {
      return ownPlateConfig.region === "JP";
    },
    isLocaleJapan() {
      // for hack
      console.log(this.$i18n.locale);
      // return this.$i18n.locale === "ja";
      // TODO: why not ja ?
      return this.$i18n.locale !== "en" && this.$i18n.locale !== "fr";
    },
    serviceKey() {
      return this.isJapan ? "omochikaeri" : "ownPlate";
    },
    regionMultiple() {
      return this.$store.getters.stripeRegion.multiple;
    },
    // for user agent detect
    isIOS() {
      return this.isOldIOS || this.isNewIOS;
    },
    isOldIOS() {
      return /iP(hone|(o|a)d)/.test(navigator.userAgent);
    },
    isNewIOS() {
      return this.isSafari && typeof document.ontouchstart !== "undefined";
    },
    isSafari() {
      return /Safari/.test(navigator.userAgent);
    },
    isAndroid() {
      // not implemented
      return null;
    },
    inLiff() {
      // BY path
      return !!this.$route.params.liffIndexId;
    },
    liffIndexId() {
      return this.$route.params.liffIndexId;
    },
    liff_base_path() {
      return `/liff/${this.liffIndexId}`;
    },
    isInLine() {
      // By UA
      return /Line/.test(navigator.userAgent);
    },
    isInLIFF() {
      return /LIFF/.test(navigator.userAgent);
    },
    isInFacebook() {},
    isInTwitter() {},
    isDev() {
      return firebaseConfig.projectId === "ownplate-dev";
    },
    featureHeroMobile() {
      return this.regionalSetting.FeatureHeroMobile[
        this.isLocaleJapan ? "ja" : "en"
      ];
    },
    featureHeroTablet() {
      return this.regionalSetting.FeatureHeroTablet[
        this.isLocaleJapan ? "ja" : "en"
      ];
    },
    gmapKey() {
      return GAPIKey;
    },
  },
};

export default mixin;
