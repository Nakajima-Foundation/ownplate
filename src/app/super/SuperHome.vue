<template>
  <section class="section">
    <div v-if="isAdmin">
      <h2>Admin Page</h2>
      <router-link to="/s/orders">All Orders</router-link>
    </div>
    <b-loading v-else active />
  </section>
</template>

<script>
import { functions } from "~/plugins/firebase.js";
export default {
  async mounted() {
    if (this.user && !this.credentials) {
      const getCredentials = functions.httpsCallable("getCredentials");
      const { data } = await getCredentials();
      this.$store.commit("setCredentials", data);
    }
    console.log("admin", this.isAdmin);
    if (!this.isAdmin) {
      this.$router.push("/");
    }
  },
  computed: {
    isAdmin() {
      return this.credentials && this.credentials.admin;
    },
    credentials() {
      return this.user && this.user.credentials;
    },
    user() {
      return this.$store.state.user;
    }
  }
};
</script>
