<template>
  <section class="section">
    <div v-if="isAdmin">
      <h2>Admin Page</h2>
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
    const getCredential = functions.httpsCallable("getCredential");
    const { data } = await getCredential();
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
