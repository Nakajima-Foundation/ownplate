<template>
  <div class="flex min-h-screen flex-col" @click="enableSound()">
    <!-- Notification Banner -->
    <NotificationBanner />

    <!-- Header -->
    <Header @handleOpen="handleOpen" />

    <!-- Side Bar -->
    <SideMenuWrapper ref="sideMenu" />

    <!-- Main -->
    <div class="flex-1">
      <div>
        <div
          v-if="underConstruction"
          class="bg-yellow-200 p-2 text-center font-bold text-red-500"
        >
          {{ $t("underConstruction") }}
        </div>

        <!-- approproate component under pages will be displayed -->
        <router-view v-if="isReadyToRender" />
        <dialog-box :dialog="dialog" />
      </div>
    </div>

    <!-- Loading -->
    <o-loading
      v-if="isLoading"
      :is-full-page="true"
      :active="true"
      :can-cancel="false"
    ></o-loading>

    <Footer />

    <!-- Audio Play -->
    <audio-play ref="audioPlay" />
  </div>
</template>

<script>
import { db, auth, analytics } from "@/lib/firebase/firebase9";

import { doc, getDoc, setDoc } from "firebase/firestore";

import {
  logEvent,
  setUserProperties,
  setUserId,
  setCurrentScreen,
} from "firebase/analytics";

import { onAuthStateChanged } from "firebase/auth";

import Header from "@/components/App/Header.vue";
import Footer from "@/components/App/Footer.vue";
import NotificationBanner from "@/components/App/NotificationBanner.vue";
import SideMenuWrapper from "@/components/App/SideMenuWrapper.vue";
import DialogBox from "@/components/DialogBox.vue";
import AudioPlay from "@/components/AudioPlay.vue";

import { underConstruction } from "@/utils/utils";

import * as Sentry from "@sentry/vue";
import { ownPlateConfig, mo_prefixes } from "@/config/project";
import { defaultHeader } from "@/config/header";
import { MoHeader } from "@/config/moHeader";

export default {
  components: {
    DialogBox,
    AudioPlay,
    SideMenuWrapper,
    Header,
    Footer,
    NotificationBanner,
  },
  metaInfo: mo_prefixes.some((prefix) => {
    return location.pathname.startsWith("/" + prefix);
  })
    ? MoHeader
    : defaultHeader,
  data() {
    return {
      unregisterAuthObserver: null,
      timerId: null,
      underConstruction,
    };
  },
  mounted() {
    window.addEventListener("focus", () => {
      this.$store.commit("setActive", true);
    });
    window.addEventListener("blur", () => {
      this.$store.commit("setActive", false);
    });
  },
  computed: {
    isLoading() {
      return this.$store.state.isLoading;
    },
    dialog() {
      return this.$store.state.dialog;
    },
    isReadyToRender() {
      if (this.user !== undefined) {
        return true; // Firebase has already identified the user (or non-user)
      }
      if (
        this.$route.path === `/r/${this.restaurantId()}` ||
        this.$route.path === "/"
      ) {
        console.log("isReadyToRender: quick render activated");
        return true; // We are opening the restaurant page
      }
      return false;
    },
    uid() {
      return this.$store.getters.uid;
    },
    isInMo() {
      return mo_prefixes.some((prefix) => {
        return (
          (this.$route.fullPath || "").startsWith(`/${prefix}/`) ||
          (this.$route.fullPath || "") === `/${prefix}`
        );
      });
    },
  },
  methods: {
    async enableSound() {
      await this.$refs.audioPlay.enableSound();
    },
    handleOpen() {
      this.$refs.sideMenu.handleOpen();
    },
    pingAnalytics() {
      setCurrentScreen(analytics, document.title);
      logEvent(analytics, "page_view");
      logEvent(analytics, "screen_view", {
        app_name: "web",
        screen_name: document.title,
      });
    },
  },
  beforeCreate() {
    this.$store.commit("setServerConfig", { region: ownPlateConfig.region });
    this.unregisterAuthObserver = onAuthStateChanged(auth, async (user) => {
      if (user) {
        user
          .getIdTokenResult(true)
          .then((result) => {
            this.$store.commit("setUser", user);
            this.$store.commit("setCustomClaims", result.claims);
            console.log(!!user.email ? "admin" : "customer");
          })
          .catch((error) => {
            console.error("getIdTokenResult", error);
            Sentry.captureException(error);
          });
        setUserProperties(analytics, {
          role: !!user.email ? "admin" : "customer",
        });
        setUserId(analytics, user.uid);

        if (this.isInMo) {
          window.dataLayer.push({
            uid: user.uid,
          });
        }
      } else {
        setUserProperties(analytics, { role: "anonymous" });
        console.log("authStateChanged: null");
        this.$store.commit("setUser", null);
        if (this.isInMo) {
          window.dataLayer.push({
            uid: null,
          });
        }
      }
    });
  },
  watch: {
    // https://support.google.com/analytics/answer/9234069?hl=ja
    $route() {
      this.pingAnalytics();
    },
  },
  async created() {
    console.log(process.env.VUE_APP_CIRCLE_SHA1);
    const isInLine = () => {
      return /Line/.test(navigator.userAgent);
    };
    const isInLIFF = () => {
      return /LIFF/.test(navigator.userAgent);
    };

    if (!isInLIFF) {
      if (isInLine) {
        if (/\?/.test(window.location.href)) {
          window.location.href =
            window.location.href + "&openExternalBrowser=1";
        } else {
          window.location.href =
            window.location.href + "?openExternalBrowser=1";
        }
        return;
      }
    }

    this.timerId = window.setInterval(() => {
      this.$store.commit("updateDate");
    }, 60 * 1000);

    this.pingAnalytics();
  },
  destroyed() {
    if (this.unregisterAuthObserver) {
      this.unregisterAuthObserver();
    }
    if (this.timerId) {
      window.clearInterval(this.timerId);
    }
  },
};
</script>
<style lang="scss">
// ### Need this commentout for CSS parser bug. Don't remove.
</style>
