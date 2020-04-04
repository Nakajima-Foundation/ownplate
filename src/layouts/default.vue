<template>
<div>
  <b-navbar>
    <template slot="brand">
      <b-navbar-item tag="router-link" :to="{ path: '/' }">
        <img
          src="/OwnPlate-Logo-Horizontal-YellowWhite.svg"
          alt="Lightweight UI components for Vue.js based on Bulma"
          />
        <!-- <p class="p-font bold logo">
             OwnPlate
             </p> -->
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
        <b-navbar-item href="/dist/mypage">
          <span class="icon">
            <i class="fas fa-th-list"></i>
          </span>
          <span class="nav-item">mypage</span>
        </b-navbar-item>
        <b-navbar-item href="/dist/mypage/profile">
          <span class="icon">
            <i class="fas fa-user-circle"></i>
          </span>
          <span class="nav-item">profile</span>
        </b-navbar-item>
        <b-navbar-item href="/dist/mypage/payment">
          <span class="icon">
            <i class="fas fa-money-check"></i>
          </span>
          <span class="nav-item">setting</span>
        </b-navbar-item>
        <b-navbar-item href="/dist/mypage/agreement">
          <span class="icon">
            <i class="fas fa-id-card"></i>
          </span>
          <span class="nav-item">payment</span>
        </b-navbar-item>
        <b-navbar-item href="/dist/mypage/billinghistory">
          <span class="icon">
            <i class="fas fa-history"></i>
          </span>
          <span class="nav-item">history</span>
        </b-navbar-item>
        <b-navbar-item v-if="hasUser" @click="signout">
          <span class="icon">
            <i class="fas fa-sign-out-alt"></i>
          </span>
          <span class="nav-item">Sign Out</span>
        </b-navbar-item>
      </b-navbar-dropdown>
    </template>
  </b-navbar>

  <!-- pagesのコンポーネントが読み込まれる -->
  <nuxt style="max-width:100%;background:#FBF9F9" v-if="loaded" ></nuxt>
  <!-- pagesのコンポーネントが読み込まれる -->

  <footer class="footer">
    <div class="footer-sections">
      <div class="columns is-desktop" style="margin-top:-3rem;">
        <div class="column">
          <div class="level-left">
            <p class="level-item p-font">
              <a>
                <span class="icon has-text-info">
                  <i class="far fa-file-alt"></i>
                </span>
                Private
              </a>
            </p>
            <p class="level-item p-font">
              <a>
                <span class="icon has-text-info">
                  <i class="far fa-file-alt"></i>
                </span>
                Tokushoho
              </a>
            </p>
            <p class="level-item p-font">
              <a>
                <span class="icon has-text-info">
                  <i class="far fa-file-alt"></i>
                </span>
                Riyokiyku
              </a>
            </p>
            <p class="level-item p-font">
              <a>
                <span class="icon has-text-info">
                  <i class="fas fa-info-circle"></i>
                </span>
                Contact
              </a>
            </p>
          </div>
        </div>
        <div class="column">
          <div class="level-left">
            <p class="level-item p-font">
              <a>
                <span class="icon has-text-info">
                  <i class="far fa-envelope"></i>
                </span>
                Mail
              </a>
            </p>
            <p class="level-item p-font">
              <a>
                <span class="icon has-text-info">
                  <i class="fas fa-info-circle"></i>
                </span>
                <nuxt-link
                  v-if="$i18n.locale !== 'en'"
                  :to="switchLocalePath('en')"
                  >
                  English
                </nuxt-link>
                <nuxt-link
                  v-if="$i18n.locale !== 'es'"
                  :to="switchLocalePath('es')"
                  >
                  Español
                </nuxt-link>
                <nuxt-link
                  v-if="$i18n.locale !== 'ja'"
                  :to="switchLocalePath('ja')"
                  >
                  日本語
                </nuxt-link>
              </a>
            </p>
          </div>

            <div class="mainichi-info" style="margin-top:1rem;">
              <p class="p-font-mini">
                TEL
                <span class="title" style="margin-left:1rem;">
                  0120-000-000
                </span>
              </p>
              <p class="p-font-mini">
                hugahuga 000-0000-0000
              </p>
              <p class="p-font-mini">
                TIme AM10:00〜PM5（Excluding weekends and holidays）
              </p>
            </div>
          </div>
        </div>

        <div class="content has-text-left">
          <p class="p-font-mini">
            hogahugapiyo
          </p>
          <p class="p-font-mini">
            Copyright Nakajima. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { auth } from '@/plugins/firebase.js';

export default {

  data() {
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
    };
  },
  computed: {
    loaded() {
      return !this.$store.state.user.loading;
    },
    hasUser() {
      return this.$store.state.user.user !== null;
    }
  },
  methods: {
    async signout() {
      console.log("signing out", auth.currentUser);
      try {
        auth.signOut()
        console.log("sign out succeeded", this.hasUser);
      } catch(error) {
        console.log("sign out failed", error);
      }
    }
  },
  beforeCreate() {
    this.$store.commit('user/SET_LOADING', true);
    this.unregisterAuthObserver = auth.onAuthStateChanged(async (user) => {
      console.log("authStateChanged", user && user.email, user && user.phoneNumber);
      if (user) {
        if (user.email) {
          this.$store.commit('admin/SET_USER', user);
        }
        if (user.phoneNumber) {
          this.$store.commit('user/SET_USER', user);
        }
      } else {
        this.$store.commit('admin/SET_USER', null);
        this.$store.commit('user/SET_USER', null);
      }
      this.$store.commit('user/SET_LOADING', false);
    });
  },
  destroyed() {
    if (this.unregisterAuthObserver) {
      this.unregisterAuthObserver();
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

.mainichi-info .p-font-mini {
  line-height: 1.6rem;
}

.logo {
  color: rgb(255, 255, 255);
  font-weight: 900;
}
</style>
