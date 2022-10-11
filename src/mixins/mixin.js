import Vue from "vue";
import { db } from "@/plugins/firebase";
import { firebaseConfig, ownPlateConfig } from "@/config/project";
import { regionalSettings } from "@/config/constant";
import moment from "moment";

import { defaultHeader } from "@/config/header";
import { formatOption } from "@/utils/strings";

import { arraySum, roundPrice, taxRate } from "@/utils/utils";
import { GAPIKey } from "@/config/project";

const mixin = {
  methods: {
    restaurantId() {
      return this.$route.params.restaurantId;
    },
    resizedProfileImage(restaurant, size) {
      return (
        (restaurant.images?.profile?.resizedImages || {})[size] ||
        restaurant.restProfilePhoto
      );
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
    displayOption(option, shopInfo, item) {
      return formatOption(option, (price) => {
        return this.$n(roundPrice(price * taxRate(shopInfo, item)), "currency");
      });
    },
  },
  computed: {
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
    isAnonymous() { // TODO
      return this.$store.getters.isAnonymous;
    },
    isLineUser() { // TODO
      const claims = this.$store.state.claims;
      return !!claims?.line;
    },
    isLineEnabled() { // TODO
      return !!ownPlateConfig.line;
    },
    isLocaleJapan() {
      // for hack
      console.log(this.$i18n.locale);
      // return this.$i18n.locale === "ja";
      // TODO: why not ja ?
      return this.$i18n.locale !== "en" && this.$i18n.locale !== "fr";
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
    isInLine() { // TODO
      // By UA
      return /Line/.test(navigator.userAgent);
    },
    isInLIFF() {
      return /LIFF/.test(navigator.userAgent);
    },
    isDev() { // TODO 
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
    gmapKey() { // TODO
      return GAPIKey;
    },
  },
};

export default mixin;
