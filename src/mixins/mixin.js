import Vue from "vue";
import { firebaseConfig, ownPlateConfig } from "@/config/project";
import { regionalSettings } from "@/config/constant";
import moment from "moment";

import { defaultHeader } from "@/config/header";
import { formatOption } from "@/utils/strings";

import { roundPrice, taxRate } from "@/utils/utils";

const mixin = {
  methods: {
    restaurantId() {
      return this.$route.params.restaurantId;
    },
    resizedProfileImage(restaurant, size) {
      return (
        (restaurant?.images?.profile?.resizedImages || {})[size] ||
        restaurant?.restProfilePhoto
      );
    },
    moment(value) {
      return moment(value);
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
    isAnonymous() {
      // TODO
      return this.$store.getters.isAnonymous;
    },
    isLineUser() {
      // TODO
      const claims = this.$store.state.claims;
      return !!claims?.line;
    },
    isLineEnabled() {
      // TODO
      return !!ownPlateConfig.line;
    },
    inLiff() {
      // BY path
      return !!this.$route.params.liffIndexId;
    },
    liffIndexId() {
      return this.$route.params.liffIndexId;
    },
    isUser() {
      return !!this.$store.getters.uidUser;
    },
    isNotSuperAdmin() {
      return this.$store.getters.isNotSuperAdmin;
    },
    isNotOperator() {
      return this.$store.getters.isNotOperator;
    },
  },
};

export default mixin;
