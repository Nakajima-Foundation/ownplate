<template>
  <section class="section">
    <div v-if="$store.getters.isSuperAdmin">
      <h2>Admin Page</h2>
      <router-link to="/s/orders">All Orders</router-link>
      <br />
      <router-link to="/s/callbacks">All Callbacks</router-link>
      <br />
      <router-link to="/s/restaurants">All Restaurants</router-link>
      <br />
      <router-link to="/s/requests">All Requests</router-link>
      <br />
      <router-link to="/s/admins">All Admins</router-link>
      <br />
      <router-link to="/s/profiles">All Profiles</router-link>
      <br />
      <router-link to="/s/logs">All Logs</router-link>
      <br />
      <router-link to="/s/phonelogs">All Phone Logs</router-link>
      <br />
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
  }
};
</script>
