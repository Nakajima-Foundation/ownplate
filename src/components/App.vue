<template>
  <div class="flex min-h-screen flex-col" @click="enableSound()">
    <!-- Notification Banner -->
    <NotificationBanner />

    <!-- Header -->
    <AppHeader @handleOpen="handleOpen" />

    <!-- Side Bar -->
    <SideMenu ref="sideMenu" />

    <!-- Main -->
    <div class="flex-1">
      <div>
        <div
          v-if="isDev"
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
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm"
         v-if="isLoading"
         >
      <div role="status" class="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2">
        <svg aria-hidden="true" class="w-20 h-20 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
      </div>
    </div>

    <AppFooter />

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

import { auth, analytics } from "@/lib/firebase/firebase9";

import {
  logEvent,
  setUserProperties,
  setUserId,
  setCurrentScreen,
} from "firebase/analytics";

import { onAuthStateChanged, Unsubscribe, signOut } from "firebase/auth";

import AppHeader from "@/components/App/Header.vue";
import AppFooter from "@/components/App/Footer.vue";
import NotificationBanner from "@/components/App/NotificationBanner.vue";
import SideMenu from "@/components/App/SideMenu.vue";
import DialogBox from "@/components/DialogBox.vue";
import AudioPlay from "@/components/AudioPlay.vue";

import { isDev, useUser, useRestaurantId } from "@/utils/utils";

import * as Sentry from "@sentry/vue";
import { ownPlateConfig } from "@/config/project";
import { defaultHeader } from "@/config/header";

import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { useHead } from "@unhead/vue";

export default defineComponent({
  name: "App",
  components: {
    DialogBox,
    AudioPlay,
    SideMenu,
    AppHeader,
    AppFooter,
    NotificationBanner,
  },

  setup() {
    let unregisterAuthObserver: null | Unsubscribe = null;
    let timerId: null | number = null;
    const store = useStore();
    const route = useRoute();

    const user = useUser();
    const restaurantId = useRestaurantId();

    useHead(defaultHeader);

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
      if (route.path === `/r/${restaurantId.value}` || route.path === "/") {
        // console.log("isReadyToRender: quick render activated");
        return true; // We are opening the restaurant page
      }
      return false;
    });
    const audioPlay = ref();
    const enableSound = () => {
      if (audioPlay.value?.enableSound) {
        audioPlay.value.enableSound();
      }
    };
    const sideMenu = ref();
    const handleOpen = () => {
      sideMenu.value.handleOpen();
    };
    const pingAnalytics = () => {
      setCurrentScreen(analytics, document.title);
      logEvent(analytics, "page_view");
      logEvent(analytics, "screen_view", {
        app_name: "web",
        screen_name: document.title,
      });
    };

    store.commit("setServerConfig", { region: ownPlateConfig.region });
    unregisterAuthObserver = onAuthStateChanged(auth, (fUser) => {
      if (fUser) {
        fUser
          .getIdTokenResult(true)
          .then((result) => {
            const diff =
              Date.now() - Number(result.claims?.auth_time || 0) * 1000;
            if (diff > 3600 * 24 * 30 * 1000) {
              signOut(auth);
            } else {
              store.commit("setUser", fUser);
              store.commit("setCustomClaims", result.claims);
            }
            // console.log(!!user.email ? "admin" : "customer");
          })
          .catch((error: any) => {
            // console.error("getIdTokenResult", error);
            Sentry.captureException(error);
          });
        setUserProperties(analytics, {
          role: fUser.email ? "admin" : "customer",
        });
        setUserId(analytics, fUser.uid);
      } else {
        setUserProperties(analytics, { role: "anonymous" });
        // console.log("authStateChanged: null");
        store.commit("setUser", null);
        store.commit("setCustomClaims", null);
      }
    });

    console.log(import.meta.env.VUE_APP_CIRCLE_SHA1);
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
      const diff = (new Date() - store.state.openTime) / 1000; // second
      if (diff > 20 * 3600) {
        store.commit("resetOpenTime");
        location.reload();
      }
      store.commit("updateDate");
    }, 60 * 1000);

    watch(
      () => route.path,
      () => {
        // https://support.google.com/analytics/answer/9234069?hl=ja
        pingAnalytics();
      },
    );

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
      isDev,

      enableSound,
      handleOpen,
      isReadyToRender,
      dialog,
      isLoading,
    };
  },
});
</script>
<style lang="scss">
// ### Need this commentout for CSS parser bug. Don't remove.
</style>
