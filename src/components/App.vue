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
    <Loading v-if="isLoading" />
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
import Loading from "@/components/Loading.vue";
import { isDev, useUser, useRestaurantId } from "@/utils/utils";

import * as Sentry from "@sentry/vue";
import { defaultHeader } from "@/config/header";

import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { useHead } from "@unhead/vue";

import { useGeneralStore } from "../store";

export default defineComponent({
  name: "App",
  components: {
    DialogBox,
    AudioPlay,
    SideMenu,
    AppHeader,
    AppFooter,
    NotificationBanner,
    Loading,
  },

  setup() {
    let unregisterAuthObserver: null | Unsubscribe = null;
    let timerId: null | number = null;
    const store = useStore();
    const generalStore = useGeneralStore();

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
          })
          .catch((error: any) => {
            Sentry.captureException(error);
          });
        setUserProperties(analytics, {
          role: fUser.email ? "admin" : "customer",
        });
        setUserId(analytics, fUser.uid);
      } else {
        setUserProperties(analytics, { role: "anonymous" });
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

    let openTime = new Date();
    timerId = window.setInterval(() => {
      const diff = (new Date() - openTime) / 1000; // second
      if (diff > 20 * 3600) {
        openTime = new Date();
        location.reload();
      }
      generalStore.updateDate();
      store.commit("updateDate"); // TODO remove
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
