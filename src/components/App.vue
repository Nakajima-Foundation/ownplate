<template>
  <metainfo>
    <template v-slot:title="{ content }">{{ content }}</template>
  </metainfo>
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
      iconSize="large"
      :full-page="true"
      :active="true"
      :can-cancel="false"
    >
      <o-icon
        pack="fas"
        icon="circle-notch"
        customSize="fa-4x"
        spin
        class="opacity-30"
      ></o-icon>
    </o-loading>

    <Footer />

    <!-- Audio Play -->
    <audio-play ref="audioPlay" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  computed,
  watch,
  ref,
  onUnmounted,
} from "vue";

import { db, auth, analytics } from "@/lib/firebase/firebase9";

import { doc, getDoc, setDoc } from "firebase/firestore";

import {
  logEvent,
  setUserProperties,
  setUserId,
  setCurrentScreen,
} from "firebase/analytics";

import { onAuthStateChanged, Unsubscribe } from "firebase/auth";

import Header from "@/components/App/Header.vue";
import Footer from "@/components/App/Footer.vue";
import NotificationBanner from "@/components/App/NotificationBanner.vue";
import SideMenuWrapper from "@/components/App/SideMenuWrapper.vue";
import DialogBox from "@/components/DialogBox.vue";
import AudioPlay from "@/components/AudioPlay.vue";

import { underConstruction, useUser, useRestaurantId } from "@/utils/utils";

import * as Sentry from "@sentry/vue";
import { ownPlateConfig, mo_prefixes } from "@/config/project";
import { defaultHeader } from "@/config/header";
import { MoHeader } from "@/config/moHeader";

import { useStore } from "vuex";
import { useRoute } from "vue-router";

export default defineComponent({
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

  setup() {
    let unregisterAuthObserver: null | Unsubscribe =  null;
    let timerId: null | number = null;
    const store = useStore();
    const route = useRoute();

    const user = useUser();
    const restaurantId = useRestaurantId();
    
    onMounted(() => {
      window.addEventListener("focus", () => {
        store.commit("setActive", true);
      });
      window.addEventListener("blur", () => {
        store.commit("setActive", false);
      });
    });

    const isLoading = computed(() => {
      return store.state.isLoading;
    });
    const dialog = computed(() => {
      return store.state.dialog;
    });
    const isReadyToRender = computed(() => {
      if (user.value !== undefined) {
        return true; // Firebase has already identified the user (or non-user)
      }
      if (
        route.path === `/r/${restaurantId.value}` ||
        route.path === "/"
      ) {
        // console.log("isReadyToRender: quick render activated");
        return true; // We are opening the restaurant page
      }
      return false;
    });
    const isInMo = computed(() => {
      return mo_prefixes.some((prefix) => {
        return (
          (route.fullPath || "").startsWith(`/${prefix}/`) ||
          (route.fullPath || "") === `/${prefix}`
        );
      });
    });

    const audioPlay = ref();
    const enableSound = () => {
      audioPlay.value.enableSound();
    };
    const sideMenu = ref();
    const handleOpen = () => {
      sideMenu.value.handleOpen();
    };
    const pingAnalytics = () => {
      setCurrentScreen(analytics, document.title);
      logEvent(analytics, "page_view");
      // @ts-ignore
      logEvent(analytics, "screen_view", {
        app_name: "web",
        screen_name: document.title,
      });
    };

    store.commit("setServerConfig", { region: ownPlateConfig.region });
    unregisterAuthObserver = onAuthStateChanged(auth, async (fUser) => {
      if (fUser) {
        fUser
          .getIdTokenResult(true)
          .then((result) => {
            store.commit("setUser", fUser);
            store.commit("setCustomClaims", result.claims);
            // console.log(!!fUser.email ? "admin" : "customer");
          })
          .catch((error: any) => {
            // console.error("getIdTokenResult", error);
            Sentry.captureException(error);
          });
        setUserProperties(analytics, {
          role: !!fUser.email ? "admin" : "customer",
        });
        setUserId(analytics, fUser.uid);

        if (isInMo.value) {
          // @ts-ignore
          window.dataLayer.push({
            uid: fUser.uid,
          });
        }
      } else {
        setUserProperties(analytics, { role: "anonymous" });
        // console.log("authStateChanged: null");
        store.commit("setUser", null);
        store.commit("setCustomClaims", null);
        if (isInMo.value) {
          // @ts-ignore
          window.dataLayer.push({
            uid: null,
          });
        }
      }
    });
    
    console.log(process.env.VUE_APP_CIRCLE_SHA1);
    const isInLine = /Line/.test(navigator.userAgent);
    const isInLIFF = /LIFF/.test(navigator.userAgent);

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

    timerId = window.setInterval(() => {
      // @ts-ignore
      const diff = (new Date() - store.state.openTime) / 1000; // second
      if (diff > 20 * 3600) {
        store.commit("resetOpenTime");
        location.reload();
      }
      store.commit("updateDate");
    }, 60 * 1000);
    
    watch(() => route.path, () => {
      // https://support.google.com/analytics/answer/9234069?hl=ja
      pingAnalytics();
    });
      
    pingAnalytics();

    onUnmounted(() => {
      if (unregisterAuthObserver) {
        unregisterAuthObserver();
      }
      if (timerId) {
        window.clearInterval(timerId);
      }
    });
    return {
      audioPlay,
      sideMenu,
      underConstruction,

      enableSound,
      handleOpen,
      isReadyToRender,
      dialog,
      isLoading
      
    }
  },

});
</script>
<style lang="scss">
// ### Need this commentout for CSS parser bug. Don't remove.
</style>
