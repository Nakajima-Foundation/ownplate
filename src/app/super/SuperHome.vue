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
  watch: {
    isReadyToRender:{
      immediate: true,
      handler: function(newValue) {
        if (newValue) {
          if (this.isNotSuperAdmin) {
            this.$router.push("/");
          }
        }
        return newValue;
      }
    },
  },
  computed: {
    isReadyToRender() {
      return (this.$store.state.user !== undefined);
    },
    isNotSuperAdmin() {
      return this.$store.getters.isNotSuperAdmin;
    }
  }
};
</script>
