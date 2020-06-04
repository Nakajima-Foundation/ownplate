<template>
  <div class="wrapper" @click="enableSound()">
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
      <div class="align-center m-t-24">
        <router-link to="/">
          <img class="w-96" :src="`/${this.logo2}`" />
        </router-link>
      </div>
      <div class="align-center m-t-24">
        <router-link to="/">
          <div class="op-button-medium tertiary w-192" @click="handleClose()">{{ $t("menu.home") }}</div>
        </router-link>
      </div>
      <div class="align-center m-t-24">
        <router-link to="/u/profile">
          <div class="op-button-small tertiary" @click="handleClose()">{{ $t("profile.title") }}</div>
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
            <span class="c-text-white-high t-body1">
              {{
              languages[language]
              }}
            </span>
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
            <span class="t-body1">{{ lang }}</span>
          </div>
        </div>
        <div class="m-t-24 align-center">
          <div class="op-button-small tertiary" @click="closeLang()">{{ $t("menu.close") }}</div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { db, auth, functions } from "@/plugins/firebase.js";
import { regionalSettings } from "~/plugins/constant.js";
import { releaseConfig } from "~/plugins/config.js";
import { ownPlateConfig } from "@/config/project";
import DialogBox from "~/components/DialogBox";

export default {
  components: {
    DialogBox
  },
  data() {
    const regionalSetting = regionalSettings[ownPlateConfig.region || "US"];
    return {
      language: regionalSetting.defaultLanguage,
      languages: regionalSetting.languages,
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
      logo: regionalSetting.Logo,
      logo2: regionalSetting.Logo2,
      // todo support scrset https://kanoto.info/201912/673/
      // srcset: regionalSetting.Logo.map((logo) => {}

      open: false,
      overlay: true,
      fullheight: true,
      fullwidth: false,
      right: false,

      langPopup: false,

      audioContext: new (window.AudioContext || window.webkitAudioContext)(),
      pleyedSilent: false,
      buffer: null
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
    dialog() {
      return this.$store.state.dialog;
    },
    isReadyToRender() {
      if (this.user !== undefined) {
        return true; // Firebase has already identified the user (or non-user)
      }
      if (this.$route.path === `/r/${this.restaurantId()}`) {
        console.log("isReadyToRender: quick render activated");
        return true; // We are opening the restaurant page
      }
      return false;
    },
    underConstruction() {
      return releaseConfig.underConstruction;
    },
    user() {
      return this.$store.state.user;
    },
    hasUser() {
      return !this.isNull(this.$store.state.user);
    },
    isAdmin() {
      //console.log(this.$store.getters.uidAdmin);
      return !!this.$store.getters.uidAdmin;
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
    async enableSound() {
      // console.log(this.$store.state.orderEvent);
      if (!this.pleyedSilent) {
        console.log("default: enableSound");
        try {
          const src = this.audioContext.createBufferSource();
          src.buffer = this.audioContext.createBuffer(1, 1, 22050);
          src.connect(this.audioContext.destination);
          src.start(0);
          console.log("default: silent played");

          const res = await fetch("/dora.mp3");
          this.buffer = await res.arrayBuffer();
          this.pleyedSilent = true;
          this.$store.commit("soundEnable");
        } catch (e) {
          console.log(e);
          Sentry.captureException(e, {
            tags: {
              view: "layouts/default",
              methods: "enableSound",
            }
          });
          console.log("default: layout sound not enabled");
        }
      }
    },
    async play() {
      if (this.buffer) {
        if (this.$store.state.soundOn) {
          this.audioContext.decodeAudioData(
            this.buffer.slice(0),
            _audioBuffer => {
              const source = this.audioContext.createBufferSource();
              source.buffer = _audioBuffer;
              source.connect(this.audioContext.destination);
              source.start(0);
            }
          );
        } else {
          console.log("silent order update");
        }
      }
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
    const systemGetConfig = functions.httpsCallable("systemGetConfig");
    systemGetConfig().then(result => {
      this.$store.commit("setServerConfig", result.data);
    });
    this.unregisterAuthObserver = auth.onAuthStateChanged(async user => {
      if (user) {
        console.log(
          "authStateChanged:",
          user.email || user.phoneNumber,
          user.uid
        );
        if (this.isUser) {
          const snapshot = await db.doc(`users/${user.uid}`).get();
          const doc = snapshot.data();
          if (doc && doc.name) {
            user.name = doc.name;
            console.log("user.name", doc.name);
          }
        }
        user.getIdTokenResult(true).then(result => {
          this.$store.commit("setCustomClaims", result.claims);
        });
      } else {
        console.log("authStateChanged: null");
      }

      this.$store.commit("setUser", user);
    });
  },
  watch: {
    async "$route.query.lang"() {
      if (this.$route.query.lang) {
        await this.changeLang(this.$route.query.lang);
      }
    },
    async "$store.state.orderEvent"() {
      await this.play();
      console.log(this.$store.state.orderEvent);
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
    }
  },
  async created() {
    this.timerId = window.setInterval(() => {
      this.$store.commit("updateDate");
    }, 60 * 1000);

    // query
    // setting
    // browser
    if (this.$route.query.lang) {
      await this.changeLang(this.$route.query.lang);
    } else {
      const language =
        (window.navigator.languages && window.navigator.languages[0]) ||
        window.navigator.language ||
        window.navigator.userLanguage ||
        window.navigator.browserLanguage;
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
.b-navbar-item {
  font-size: 0.9rem;
}

.footer-sections {
  width: 1200px;
  max-width: 100%;
  margin-right: auto;
  margin-left: auto;
  padding-top: 1rem;
}

.nav-item {
  padding-left: 0.8rem;
}

.p-font-mini {
  line-height: 1.6rem;
}
.underConstruction {
  text-align: center;
  color: black;
  background: yellow;
  @extend .p-t-4;
  @extend .p-b-4;
}
</style>
