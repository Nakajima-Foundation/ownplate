import Vue from "vue";
import { firebaseConfig, ownPlateConfig } from "@/config/project";
import moment from "moment";

import { defaultHeader } from "@/config/header";

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
  },
  computed: {
    defaultTitle() {
      return defaultHeader.title;
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
    isLineUser() {
      // TODO
      const claims = this.$store.state.claims;
      return !!claims?.line;
    },
    isLineEnabled() {
      // TODO
      return !!ownPlateConfig.line;
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
  },
};

export default mixin;
