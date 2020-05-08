<template>
  <section class="section">
    <div v-if="$store.getters.isSuperAdmin">
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
    if (!this.$store.state.user || this.$store.getters.isNotSuperAdmin) {
      this.$router.push("/");
    }
  },
  watch: {
    isNotSuperAdmin(newValue) {
      if (newValue) {
        this.$router.push("/");
      }
    }
  },
  computed: {
    isNotSuperAdmin() {
      return this.$store.getters.isNotSuperAdmin;
    }
  }
};
</script>
