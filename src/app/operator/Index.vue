<template>
  <section class="section">
    <div v-if="$store.getters.isSuperAdmin || $store.getters.isOperator">
      <h2>Operator Page</h2>
      <router-link to="/o/orders">All Orders</router-link>
      <br />
      <router-link to="/o/restaurants">All Restaurants</router-link>
      <br />
    </div>
  </section>
</template>

<script>
import { functions } from "~/plugins/firebase.js";
export default {
  async mounted() {
    console.log(this.$store.state.user, this.$store.getters.isNotSuperAdmin, this.$store.getters.isNotOperator);
    if (!this.$store.state.user || (this.$store.getters.isNotSuperAdmin && this.$store.getters.isNotOperator)) {
      this.$router.push("/");
    }
  },
  watch: {
    isNotSuperAdmin(newValue) {
      if (newValue && isNotOperator) {
        this.$router.push("/");
      }
    },
    isNotOperator(newValue) {
      if (newValue && isNotSuperAdmin) {
        this.$router.push("/");
      }
    }

  }
};
</script>
