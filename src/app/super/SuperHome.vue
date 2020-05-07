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
import { db, firestore, functions } from "~/plugins/firebase.js";
export default {
  data() {
    return {
      credential: {}
    };
  },
  async mounted() {
    const getCredentials = functions.httpsCallable("getCredentials");
    const { data } = await getCredentials();
    this.credential = data;
    console.log("admin", this.isAdmin);
    if (!this.isAdmin) {
      this.$router.push("/");
    }
  },
  computed: {
    isAdmin() {
      return this.credential.admin;
    }
  }
};
</script>
