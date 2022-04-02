<template>
  <div class="wrapper" @click="enableSound()">
    <!-- Notification Banner -->
    <div
      v-if="isFlash"
      @click="dismissBanner()"
      class="bg-blue-500 fixed z-50 w-full h-16 flex justify-center items-center animate-pulse"
    >
      <i class="material-icons text-white text-2xl">notifications_active</i>
    </div>

    <!-- Header -->
    <div class="flex items-center h-12 bg-white">
      <div class="w-12">
        <a
          @click="handleOpen()"
          class="w-12 h-12 inline-flex justify-center items-center"
        >
          <i class="material-icons text-black opacity-50 text-2xl">menu</i>
        </a>
      </div>
      <div class="flex-1 text-center">
        <router-link :to="top_path">
          <img :class="this.logoClass" class="m-auto" :src="`/${this.logo}`" />
        </router-link>
      </div>
      <div class="w-12"></div>
    </div>

    <!-- Side Bar -->
    <b-sidebar
      type="is-light"
      :fullheight="fullheight"
      :fullwidth="fullwidth"
      :overlay="overlay"
      :right="right"
      :open.sync="open"
    >
      <!-- Logo / Home -->
      <div class="text-center mt-6 mb-4">
        <router-link :to="home_path">
          <img
            class="w-48 m-auto"
            :src="`/${this.logo2}`"
            @click="handleClose()"
          />
        </router-link>
      </div>

      <!-- Profile -->
      <div class="text-center mt-2">
        <router-link :to="base_path + '/u/profile'">
          <div
            class="inline-flex justify-center items-center rounded-full h-12 w-56 bg-op-teal text-white font-bold"
            @click="handleClose()"
          >
            <i class="material-icons mr-2">person</i>
            <span>{{ $t("profile.title") }}</span>
          </div>
        </router-link>
      </div>

      <!-- Order History -->
      <div class="text-center mt-2" v-if="isCustomer || inLiff">
        <router-link :to="historyPage">
          <div
            class="inline-flex justify-center items-center rounded-full h-12 w-56 bg-op-teal text-white font-bold"
            @click="handleClose()"
          >
            <i class="material-icons mr-2">history</i>
            <span>{{ $t("order.history") }}</span>
          </div>
        </router-link>
      </div>

      <!-- Favorites -->
      <div class="text-center mt-2" v-if="isCustomer && !inLiff">
        <router-link to="/r/favorites">
          <div
            class="inline-flex justify-center items-center rounded-full h-12 w-56 bg-op-teal text-white font-bold"
            @click="handleClose()"
          >
            <i class="material-icons mr-2">favorite</i>
            <span>{{ $t("find.likes") }}</span>
          </div>
        </router-link>
      </div>

      <!-- Find Restaurants -->
      <div
        class="text-center mt-2"
        v-if="(isCustomer || isAnonymous) && !inLiff"
      >
        <router-link to="/r">
          <div
            class="inline-flex justify-center items-center rounded-full h-12 w-56 bg-op-teal text-white font-bold"
            @click="handleClose()"
          >
            <i class="material-icons mr-2">restaurant</i>
            <span>{{ $t("find.allRestaurants") }}</span>
          </div>
        </router-link>
      </div>

      <!-- Admin Top -->
      <div class="text-center mt-2" v-if="isAdmin">
        <router-link to="/admin/restaurants">
          <div
            class="inline-flex justify-center items-center rounded-full h-12 w-56 bg-op-teal text-white font-bold"
            @click="handleClose()"
          >
            <i class="material-icons mr-2">home</i>
            <span>{{ $t("admin.news.adminTop") }}</span>
          </div>
        </router-link>
      </div>

      <!-- Links for Admin -->
      <div v-if="!isCustomer && !inLiff">
        <div class="text-center font-bold opacity-70 mt-6 mb-4">
          {{ $t("menu.forRestaurantOwner") }}
        </div>

        <!-- Manual -->
        <div class="text-center mt-2">
          <a
            href="https://docs.omochikaeri.com/manuals/manual.pdf"
            target="_blank"
            class="inline-flex justify-center items-center text-sm font-bold text-op-teal"
            @click="handleClose()"
          >
            {{ $t("menu.manualLink") }}
          </a>
        </div>

        <!-- Tips -->
        <div class="text-center mt-2">
          <a
            href="https://docs.omochikaeri.com/manuals/tips.pdf"
            target="_blank"
            class="inline-flex justify-center items-center text-sm font-bold text-op-teal"
            @click="handleClose()"
          >
            {{ $t("menu.tipsLink") }}
          </a>
        </div>

        <!-- Terms -->
        <div class="text-center mt-2">
          <router-link to="/terms/admin">
            <div
              class="inline-flex justify-center items-center text-sm font-bold text-op-teal"
              @click="handleClose()"
            >
              {{ $t("menu.termsRestaurant") }}
            </div>
          </router-link>
        </div>
      </div>

      <!-- Links for Customer -->
      <div v-if="!isAdmin">
        <div class="text-center font-bold opacity-70 mt-6 mb-4">
          {{ $t("menu.forCustomer") }}
        </div>

        <!-- Terms -->
        <div class="text-center mt-2">
          <router-link :to="base_path + '/terms/user'">
            <div
              class="inline-flex justify-center items-center text-sm font-bold text-op-teal"
              @click="handleClose()"
            >
              {{ $t("menu.termsUser") }}
            </div>
          </router-link>
        </div>
      </div>

      <!-- Links for All -->
      <div>
        <div class="text-center font-bold opacity-70 mt-6 mb-4">
          {{ $t("menu.forAllUser") }}
        </div>

        <!-- Privacy -->
        <div class="text-center mt-2">
          <router-link :to="base_path + '/privacy'">
            <div
              class="inline-flex justify-center items-center text-sm font-bold text-op-teal"
              @click="handleClose()"
            >
              {{ $t("menu.privacy") }}
            </div>
          </router-link>
        </div>
      </div>
    </b-sidebar>

    <!-- Main -->
    <div class="main">
      <div class="contents">
        <div
          v-if="underConstruction"
          class="bg-yellow-200 text-center p-2 font-bold text-red-500"
        >
          {{ $t("underConstruction") }}
        </div>

        <!-- approproate component under pages will be displayed -->
        <router-view v-if="isReadyToRender" />
        <dialog-box :dialog="dialog" />
      </div>
    </div>

    <!-- Loading -->
    <b-loading
      v-if="isLoading"
      :is-full-page="true"
      :active="true"
      :can-cancel="false"
    ></b-loading>

    <!-- Footer -->
    <div class="bg-op-gray h-52 mt-12">
      <div class="mt-4 mx-4 text-right">
        <a
          class="inline-flex justify-center items-center rounded-full h-10 bg-white bg-opacity-10 pl-4 pr-2"
          @click="openLang()"
        >
          <i class="material-icons text-lg text-white text-opacity-50 mr-2"
            >language</i
          >
          <span class="text-white text-sm font-bold text-opacity-80 mr-2">{{
            languages[language]
          }}</span>

          <i class="material-icons text-lg text-white text-opacity-50"
            >arrow_drop_down</i
          >
        </a>
      </div>
      <div class="mt-2 mx-6 text-right">
        <span class="text-xs text-white text-opacity-50">
          Operated by Singularity Society
        </span>
      </div>
    </div>

    <!-- Language Popup-->
    <b-modal :active.sync="langPopup" :width="488" scroll="keep">
      <div class="bg-white rounded-lg my-6 mx-2 shadow-lg p-6">
        <div class="text-xl font-bold text-black text-opacity-40">
          {{ $t("menu.selectLanguage") }}
        </div>

        <!-- Languages -->
        <div class="mt-4" v-for="(lang, lang_key) in languages" :key="lang_key">
          <a
            class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
            @click="changeLangAndClose(lang_key)"
            ><i
              class="material-icons text-lg text-black text-opacity-60 mr-2"
              v-if="lang_key == language"
              >check</i
            ><span class="text-sm font-bold text-op-teal">{{ lang }}</span></a
          >
        </div>

        <!-- Close -->
        <div class="mt-6 text-center">
          <a
            class="inline-flex justify-center items-center rounded-full h-12 bg-black bg-opacity-5"
            style="min-width: 10rem"
            @click="closeLang()"
            ><span class="font-bold text-black text-opacity-60 px-4"
              >{{ $t("menu.close") }}
            </span></a
          >
        </div>
      </div>
    </b-modal>

    <!-- Audio Play -->
    <audio-play ref="audioPlay" />
  </div>
</template>

<script>
import { db, auth, functions } from "@/plugins/firebase";
import { analytics } from "@/lib/firebase/firebase9";
import {
  logEvent,
  setUserProperties,
  setUserId,
  setCurrentScreen,
} from "firebase/analytics";

import DialogBox from "@/components/DialogBox";
import AudioPlay from "@/components/AudioPlay";
import * as Sentry from "@sentry/browser";
import { ownPlateConfig } from "@/config/project";
import { defaultHeader } from "@/config/header";

export default {
  components: {
    DialogBox,
    AudioPlay,
  },
  metaInfo: defaultHeader,
  data() {
    return {
      language: "en",
      languages: [],
      items: [
        {
          title: "Home",
          icon: "home",
          to: { name: "index" },
        },
        {
          title: "Inspire",
          icon: "lightbulb",
          to: { name: "inspire" },
        },
      ],
      unregisterAuthObserver: null,
      timerId: null,
      // todo support scrset https://kanoto.info/201912/673/
      // srcset: regionalSetting.Logo.map((logo) => {}

      open: false,
      overlay: true,
      fullheight: true,
      fullwidth: false,
      right: false,

      langPopup: false,
      isFlash: false,
      FlashToggle: false,
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
    hasUser() {
      return !this.isNull(this.$store.state.user);
    },
    isUser() {
      return !!this.$store.getters.uidUser;
    },
    uid() {
      return this.$store.getters.uid;
    },
    profile_path() {
      const path_prefix = this.isAdmin ? "admins" : "users";
      return `${path_prefix}/${this.uid}/private/profile`;
    },
    top_path() {
      // /liff/hoge or /
      return this.inLiff ? this.liff_base_path : "/";
    },
    // Don't use this path as link
    base_path() {
      // /liff/hoge or ''
      return this.inLiff ? this.liff_base_path : "";
    },
    home_path() {
      // /liff/hoge or /admin/restaurants or /r
      return this.inLiff
        ? this.liff_base_path
        : this.isAdmin
        ? "/admin/restaurants/"
        : "/r";
    },
    historyPage() {
      return this.base_path + "/u/history";
    },
    restaurant() {
      return this.$route.params.restaurantId;
    },
    specialLogo() {
      return {
        "5OInKqrhlpe7LHYNYXuU": {
          class: "h-8",
          image: "kuuya-logo.jpg",
        },
      };
    },
    logoClass() {
      if (this.restaurant && this.specialLogo[this.restaurant]) {
        return this.specialLogo[this.restaurant].class;
      }
      return "h-6";
    },
    logo() {
      if (this.restaurant && this.specialLogo[this.restaurant]) {
        return this.specialLogo[this.restaurant].image;
      } else {
        return this.regionalSetting.Logo;
      }
    },
    logo2() {
      return this.regionalSetting.Logo2;
    },
  },
  methods: {
    flash() {
      this.isFlash = true;
      setTimeout(() => {
        this.isFlash = false;
      }, 5000);
    },
    dismissBanner() {
      this.isFlash = false;
    },
    async enableSound() {
      await this.$refs.audioPlay.enableSound();
    },
    async signout() {
      console.log("signing out", auth.currentUser);
      try {
        auth.signOut();
        console.log("sign out succeeded", this.hasUser);
        this.$router.push("/");
      } catch (error) {
        console.log("sign out failed", error);
      }
    },
    handleOpen() {
      this.open = true;
    },
    handleClose() {
      this.open = false;
    },
    openLang() {
      this.langPopup = true;
    },
    closeLang() {
      this.langPopup = false;
    },
    changeLangAndClose(lang) {
      this.changeLang(lang);
      this.closeLang();
    },
    setLang(lang) {
      this.language = lang;
      this.$i18n.locale = lang;
      auth.languageCode = lang;
    },
    async changeLang(lang) {
      this.setLang(lang);
      await this.saveLang(lang);
    },
    async saveLang(lang) {
      if (this.hasUser || this.isAdmin) {
        await db.doc(this.profile_path).set({ lang }, { merge: true });
      } else {
        // save into store
        this.$store.commit("setLang", lang);
      }
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
    if (indexedDB) {
      var idb = indexedDB.open("inPrivate");
      idb.onsuccess = () => {
        this.$store.commit("setFirefoxPBM", false);
      };
      idb.onerror = () => {
        this.$store.commit("setFirefoxPBM", true);
      };
    } else {
      this.$store.commit("setFirefoxPBM", null);
    }
    this.$store.commit("setServerConfig", { region: ownPlateConfig.region });
    this.unregisterAuthObserver = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log(
          "authStateChanged:",
          user.email || user.phoneNumber,
          user.uid,
          user.displayName
        );
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
      } else {
        setUserProperties(analytics, { role: "anonymous" });
        console.log("authStateChanged: null");
        this.$store.commit("setUser", null);
      }
    });
  },
  watch: {
    // https://support.google.com/analytics/answer/9234069?hl=ja
    $route() {
      // console.log('route changed', this.$route)
      this.pingAnalytics();
    },
    async "$route.query.lang"() {
      if (this.$route.query.lang) {
        await this.changeLang(this.$route.query.lang);
      }
    },
    async user() {
      if (this.user) {
        // lang
        if (this.$store.state.lang) {
          this.changeLang(this.$store.state.lang);
        } else {
          const profileSnapshot = await db.doc(this.profile_path).get();
          if (profileSnapshot.exists) {
            if (profileSnapshot.data().lang) {
              this.setLang(profileSnapshot.data().lang);
            }
          }
        }
      }
    },
    async "$store.state.orderEvent"() {
      this.flash();
    },
  },
  async created() {
    console.log(process.env.VUE_APP_CIRCLE_SHA1);
    if (!this.isInLIFF) {
      if (this.isInLine) {
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
    this.language = this.regionalSetting.defaultLanguage;
    this.languages = this.regionalSetting.languages;

    this.timerId = window.setInterval(() => {
      this.$store.commit("updateDate");
    }, 60 * 1000);

    // query
    // bot
    // browser
    // setting (is not here / after user load)
    console.log("UA:" + navigator.userAgent.toLowerCase());
    if (this.$route.query.lang) {
      await this.changeLang(this.$route.query.lang);
    } else if (navigator.userAgent.toLowerCase().indexOf("googlebot") > -1) {
      if (this.isJapan) {
        await this.changeLang("ja");
      } else {
        await this.changeLang("en");
      }
    } else {
      const language =
        (window.navigator.languages && window.navigator.languages[0]) ||
        window.navigator.language ||
        window.navigator.userLanguage ||
        window.navigator.browserLanguage;
      console.log("browserlang:" + language);
      const lang = (language || "").substr(0, 2);
      if (lang.length === 2) {
        await this.setLang(lang);
      }
    }
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
