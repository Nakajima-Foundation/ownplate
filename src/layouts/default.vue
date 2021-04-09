<template>
  <div class="wrapper" @click="enableSound()">
    <!-- ### The commentout below is for Tailwind CSS workaround. ### -->

    <!-- w-4 h-4 w-9 h-9 w-12 h-12 w-16 h-16 w-20 h-20 w-24 h-24 w-32 h-32 w-48 h-48 w-72 w-full h-full -->
    <!-- mx-2 mx-4 mt-1 mt-2 mt-4 mb-1 mb-2 mb-8 ml-1 ml-2 ml-4 mr-1 mr-2 mr-4 -->
    <!-- p-0 p-1 p-2 p-4 px-1 px-2 px-3 py-1 py-2 pt-0 pt-2 pt-3 pt-4 pt-6 pl-6 pb-2 pb-4 pb-6 -->
    <!-- lg:mx-0 lg:mx-4 lg:mx-auto lg:mx-6 lg:mt-0 lg:mt-6 lg:ml-4 lg:mr-4 lg:max-w-sm lg:max-w-2xl -->

    <!-- rounded rounded-md rounded-lg rounded-full rounded-r lg:rounded-lg -->
    <!-- border-solid border-2 border-t-2 -->
    <!-- border-black border-red-700 -->
    <!-- border-opacity-10 -->

    <!-- lg:grid-cols-2 lg:grid-cols-3 lg:gap-x-12 xl:grid-cols-4 -->
    <!-- space-x-2 space-x-4 space-y-2 space-y-4 justify-evenly justify-end -->
    <!-- lg:flex-1 flex-col flex-shrink-0 -->

    <!-- flow-root clear-both float-right -->

    <!-- bg-pink-500 bg-purple-500 bg-blue-500 bg-green-600 bg-yellow-500 bg-red-700 -->
    <!-- bg-opacity-0 bg-opacity-5 bg-opacity-10 bg-opacity-50 bg-opacity-80 -->

    <!-- text-pink-500 text-purple-500 text-blue-500 text-green-600 text-yellow-500 text-red-700 hover:text-red-700 text-black -->
    <!-- text-opacity-30 text-opacity-60 text-opacity-80 -->
    <!-- lg:text-center -->
    <!-- font-normal -->

    <!-- list-outside list-disc list-none -->

    <!-- cursor-pointer -->

    <!-- ### Try to add the class name here if it doesn't work after build. ### -->

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
        <router-link to="/">
          <img class="h-6" :src="`/${this.logo}`" />
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
      <div class="text-center mt-6">
        <router-link :to="home_path">
          <img class="w-48" :src="`/${this.logo2}`" @click="handleClose()" />
        </router-link>
      </div>

      <!-- Profile -->
      <div class="text-center mt-6">
        <router-link to="/u/profile">
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
      <div class="text-center mt-2" v-if="isCustomer">
        <router-link to="/u/history">
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
      <div class="text-center mt-2" v-if="isCustomer">
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
      <div class="text-center mt-2" v-if="isCustomer || isAnonymous">
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
      <div v-if="!isCustomer">
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
          <router-link to="/terms/user">
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
          <router-link to="/privacy">
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
        <nuxt v-if="isReadyToRender"></nuxt>
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
            style="min-width: 10rem;"
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
import { db, auth, functions, analytics } from "@/plugins/firebase.js";
import { releaseConfig } from "~/plugins/config.js";
import DialogBox from "~/components/DialogBox";
import AudioPlay from "./AudioPlay";
import * as Sentry from "@sentry/browser";

export default {
  components: {
    DialogBox,
    AudioPlay
  },
  data() {
    return {
      language: "en",
      languages: [],
      items: [
        {
          title: "Home",
          icon: "home",
          to: { name: "index" }
        },
        {
          title: "Inspire",
          icon: "lightbulb",
          to: { name: "inspire" }
        }
      ],
      unregisterAuthObserver: null,
      timerId: null,
      logo: "",
      logo2: "",
      // todo support scrset https://kanoto.info/201912/673/
      // srcset: regionalSetting.Logo.map((logo) => {}

      open: false,
      overlay: true,
      fullheight: true,
      fullwidth: false,
      right: false,

      langPopup: false,
      isFlash: false,
      FlashToggle: false
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
    underConstruction() {
      return releaseConfig.underConstruction;
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
    home_path() {
      return this.isAdmin ? "/admin/restaurants/" : "/r";
    }
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
      analytics.setCurrentScreen(document.title);
      analytics.logEvent("page_view");
      analytics.logEvent("screen_view", {
        app_name: "web",
        screen_name: document.title
        // app_version: version
      });
    }
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
    const systemGetConfig = functions.httpsCallable("systemGetConfig");
    systemGetConfig()
      .then(result => {
        this.$store.commit("setServerConfig", result.data);
      })
      .catch(error => {
        console.error("systemGetConfig", error);
        Sentry.captureException(error);
      });
    this.unregisterAuthObserver = auth.onAuthStateChanged(async user => {
      if (user) {
        console.log(
          "authStateChanged:",
          user.email || user.phoneNumber,
          user.uid,
          user.displayName
        );
        user
          .getIdTokenResult(true)
          .then(result => {
            this.$store.commit("setUser", user);
            this.$store.commit("setCustomClaims", result.claims);
            console.log(!!user.email ? "admin" : "customer");
          })
          .catch(error => {
            console.error("getIdTokenResult", error);
            Sentry.captureException(error);
          });
        analytics.setUserProperties({
          role: !!user.email ? "admin" : "customer"
        });
        analytics.setUserId(user.uid);
      } else {
        analytics.setUserProperties({ role: "anonymous" });
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
    }
  },
  async created() {
    console.log(process.env.CIRCLE_SHA1);
    if (this.isInLine) {
      if (/\?/.test(window.location.href)) {
        window.location.href = window.location.href + "&openExternalBrowser=1";
      } else {
        window.location.href = window.location.href + "?openExternalBrowser=1";
      }
      return;
    }
    this.language = this.regionalSetting.defaultLanguage;
    this.languages = this.regionalSetting.languages;
    this.logo = this.regionalSetting.Logo;
    this.logo2 = this.regionalSetting.Logo2;

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
  }
};
</script>
<style lang="scss">
// ### Need this commentout for CSS parser bug. Don't remove.
</style>
