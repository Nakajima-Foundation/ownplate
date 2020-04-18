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
          <b-navbar-item href="#" v-if="hasUser" @click.prevent="signout">
            <span class="icon">
              <i class="fas fa-sign-out-alt"></i>
            </span>
            <span class="nav-item">{{$t("menu.signOut")}}</span>
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
            <p class="p-font-mini">Operated by Singularity Society.</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { db, auth } from "@/plugins/firebase.js";

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
        auth.signOut();
        console.log("sign out succeeded", this.hasUser);
        this.$router.push("/");
      } catch (error) {
        console.log("sign out failed", error);
      }
    }
  },
  beforeCreate() {
    this.unregisterAuthObserver = auth.onAuthStateChanged(async user => {
      if (user) {
        console.log(
          "authStateChanged:",
          user.email || user.phoneNumber,
          user.uid
        );
        const snapshot = await db.doc(`users/${user.uid}`).get();
        const doc = snapshot.data();
        if (doc && doc.name) {
          user.name = doc.name;
          console.log("user.name", doc.name);
        }
      } else {
        console.log("authStateChanged: null");
      }

      this.$store.commit("setUser", user);
    });
  },
  created() {
    this.timerId = window.setInterval(() => {
      this.$store.commit("updateDate");
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
