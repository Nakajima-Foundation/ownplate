<template>
  <div>
    <b-navbar>
      <template slot="brand">
        <b-navbar-item tag="router-link" :to="{ path: '/' }">
          <img :src="`/${this.logo}`" alt="Lightweight UI components for Vue.js based on Bulma" />
        </b-navbar-item>
      </template>

      <template slot="end">
        <b-navbar-dropdown
          class="b-navbar-item"
          spaced="true"
          hoverable
          right
          icon-left="github-circle"
        >
          <b-navbar-item href="/">
            <span class="icon">
              <i class="fas fa-home"></i>
            </span>
            <span class="nav-item">{{$t("menu.home")}}</span>
          </b-navbar-item>
          <b-navbar-item href="/about">
            <span class="icon">
              <i class="far fa-file-alt"></i>
            </span>
            <span class="nav-item">{{$t("menu.about")}}</span>
          </b-navbar-item>
          <b-navbar-item href="/u/history">
            <span class="icon">
              <i class="fas fa-history"></i>
            </span>
            <span class="nav-item">{{$t("order.history")}}</span>
          </b-navbar-item>
          <b-navbar-item href="#" v-if="hasUser" @click.prevent="signout">
            <span class="icon">
              <i class="fas fa-sign-out-alt"></i>
            </span>
            <span class="nav-item">{{$t("menu.signOut")}}</span>
          </b-navbar-item>
        </b-navbar-dropdown>
      </template>
    </b-navbar>
    <div v-if="underConstruction" class="underConstruction">{{$t('underConstruction')}}</div>

    <!-- approproate component under pages will be displayed -->
    <nuxt style="max-width:100%;background:#FBF9F9" v-if="$store.getters.userWasInitialized"></nuxt>

    <footer class="footer">
      <div class="footer-sections">
        <div class="columns is-desktop" style="margin-top:-3rem;">
          <div class="content has-text-left" style="color:white">
            <p class="p-font-mini">Operated by Singularity Society.</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { db, auth, functions } from "@/plugins/firebase.js";
import { regionalSettings } from "~/plugins/constant.js";
import { releaseConfig } from "~/plugins/config.js";
import { ownPlateConfig } from "@/config/project";

export default {
  data() {
    const regionalSetting = regionalSettings[ownPlateConfig.region || "US"];
    return {
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
      logo: regionalSetting.Logo
      // todo support scrset https://kanoto.info/201912/673/
      // srcset: regionalSetting.Logo.map((logo) => {}
    };
  },
  computed: {
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
      console.log(this.$store.getters.uidAdmin);
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
    setLang(lang) {
      this.$i18n.locale = lang;
      auth.languageCode = lang;
    },
    async changeLang(lang) {
      this.setLang(lang);
      await this.saveLang(lang);
    },
    async saveLang(lang) {
      if (this.hasUser) {
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
        await this.changeLang(lang);
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
}
</style>
