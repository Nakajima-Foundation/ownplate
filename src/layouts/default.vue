<template>
  <div class="wrapper" @click="enableSound()">
    <!-- Notification Banner -->
    <div v-if="isFlash" @click="dismissBanner()" class="notification-banner">
      <i class="material-icons c-text-white-full s-24">notifications_active</i>
    </div>

    <!-- Header -->
    <div class="cols flex-center bg-ownplate-white">
      <div>
        <div class="op-button w-48 h-48" @click="handleOpen()">
          <i class="material-icons s-24 c-text-black-medium">menu</i>
        </div>
      </div>
      <div class="flex-1 align-center">
        <router-link to="/">
          <img class="h-24" :src="`/${this.logo}`" />
        </router-link>
      </div>
      <div>
        <div class="w-48 h-48"></div>
      </div>
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
      <!-- Logo -->
      <div class="align-center m-t-24">
        <router-link to="/">
          <img class="w-96" :src="`/${this.logo2}`" />
        </router-link>
      </div>

      <!-- Home -->
      <div class="align-center m-t-24">
        <router-link to="/">
          <div class="op-button-medium tertiary w-192" @click="handleClose()">{{ $t("menu.home") }}</div>
        </router-link>
      </div>

      <!-- Profile -->
      <div class="align-center m-t-24">
        <router-link to="/u/profile">
          <div class="op-button-small tertiary" @click="handleClose()">{{ $t("profile.title") }}</div>
        </router-link>
      </div>

      <!-- Terms for Restaurant -->
      <div class="align-center m-t-24">
        <router-link to="/terms/admin" target="_blank">
          <div
            class="op-button-text t-button"
            @click="handleClose()"
          >{{ $t("menu.termsRestaurant") }}</div>
        </router-link>
      </div>

      <!-- Terms for User -->
      <div class="align-center">
        <router-link to="/terms/user" target="_blank">
          <div class="op-button-text t-button" @click="handleClose()">{{ $t("menu.termsUser") }}</div>
        </router-link>
      </div>

      <!-- Privacy -->
      <div class="align-center">
        <router-link to="/privacy" target="_blank">
          <div class="op-button-text t-button" @click="handleClose()">{{ $t("menu.privacy") }}</div>
        </router-link>
      </div>
    </b-sidebar>

    <!-- Main -->
    <div class="main">
      <div class="contents">
        <div v-if="underConstruction" class="underConstruction">{{ $t("underConstruction") }}</div>

        <!-- approproate component under pages will be displayed -->
        <nuxt v-if="isReadyToRender"></nuxt>
        <dialog-box :dialog="dialog" />
      </div>
    </div>

    <!-- Loading -->
    <b-loading v-if="isLoading" :is-full-page="true" :active="true" :can-cancel="false"></b-loading>

    <!-- Footer -->
    <div class="m-t-48">
      <div class="bg-ownplate-gray cols h-128">
        <div class="flex-1">
          <div
            class="is-inline-block t-caption c-text-white-medium m-t-16 m-l-16"
          >Operated by Singularity Society</div>
        </div>
        <div class="align-right">
          <div class="op-button-pill bg-sattle-white m-r-16 m-t-16" @click="openLang()">
            <i class="material-icons c-text-white-high">language</i>
            <span class="c-text-white-high t-button">{{ languages[language] }}</span>
            <i class="material-icons c-text-white-high">arrow_drop_down</i>
          </div>
        </div>
      </div>
    </div>

    <!-- Language Popup-->
    <b-modal :active.sync="langPopup" :width="488" scroll="keep">
      <div class="op-dialog p-t-24 p-l-24 p-r-24 p-b-24">
        <div class="t-h6 c-text-black-disabled p-b-8">{{ $t("menu.selectLanguage") }}</div>
        <div class="m-t-16" v-for="(lang, lang_key) in languages" :key="lang_key">
          <div class="op-button-pill bg-form" @click="changeLangAndClose(lang_key)">
            <i class="material-icons c-text-black-high" v-if="lang_key == language">check</i>
            <span class="t-button">{{ lang }}</span>
          </div>
        </div>
        <div class="m-t-24 align-center">
          <div class="op-button-small tertiary" @click="closeLang()">{{ $t("menu.close") }}</div>
        </div>
      </div>
    </b-modal>
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
    // # Not In Use: flashStyle()
    flashStyle() {
      if (this.isFlash) {
        setTimeout(() => {
          this.FlashToggle = !this.FlashToggle;
        }, 200);
        if (this.FlashToggle) {
          return "background-color: rgba(2, 136, 209, 0.8)";
        } else {
          return "background-color: rgba(2, 136, 209, 0.9)";
        }
      }
      return "";
    },
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
          })
          .catch(error => {
            console.error("getIdTokenResult", error);
            Sentry.captureException(error);
          });
      } else {
        console.log("authStateChanged: null");
        this.$store.commit("setUser", null);
      }
    });
  },
  watch: {
    // https://support.google.com/analytics/answer/9234069?hl=ja
    $route () {
      // console.log('route changed', this.$route)
      analytics.setCurrentScreen(document.title);
      analytics.logEvent("page_view");
      analytics.logEvent("screen_view", {
        app_name: "web",
        screen_name: document.title,
        // app_version: version
      });
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
    } else if (navigator.userAgent.toLowerCase().indexOf('googlebot') > -1) {
      if (this.isJapan) {
        await this.changeLang("ja")
      } else {
        await this.changeLang("en")
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
.notification-banner {
  position: fixed;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 64px;
  animation-duration: 0.5s;
  animation-name: bannerBlink;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}
@keyframes bannerBlink {
  from {
    background-color: rgba(2, 136, 209, 0.6);
  }
  to {
    background-color: rgba(2, 136, 209, 0.9);
  }
}

.underConstruction {
  text-align: center;
  color: black;
  background: yellow;
  @extend .p-t-4;
  @extend .p-b-4;
}
</style>
