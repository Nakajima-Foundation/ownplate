<template>
  <div>
    <b-navbar>
      <template slot="brand">
        <b-navbar-item tag="router-link" :to="{ path: '/' }">
          <img
            src="/OwnPlate-Logo-Horizontal-YellowWhite.svg"
            alt="Lightweight UI components for Vue.js based on Bulma"
            />
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

    <!-- approproate component under pages will be displayed -->
    <nuxt style="max-width:100%;background:#FBF9F9" v-if="$store.getters.userWasInitialized"></nuxt>

    <footer class="footer">
      <div class="footer-sections">
        <div class="columns is-desktop" style="margin-top:-3rem;">
          <div class="content has-text-left" style="color:white">
            <p class="p-font-mini">
              Operated by Singularity Society.
            </p>
          </div>
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
      timerId: null
    };
  },
  computed: {
    hasUser() {
      return this.$store.state.user !== null;
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
    this.unregisterAuthObserver = auth.onAuthStateChanged(async (user) => {
      console.log("authStateChanged", user && user.email, user && user.phoneNumber);
      this.$store.commit('setUser', user);
    });
  },
  created() {
    this.timerId = window.setInterval(()=>{
      this.$store.commit('updateDate');
    }, 60 * 1000);
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

</style>
