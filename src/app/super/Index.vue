<template>
  <section class="px-6 pb-12 pt-4 mx-auto max-w-full">
    <div v-if="$store.getters.isSuperAdmin">
      <h2>Admin Page</h2>
      <router-link to="/s/orders" class="text-sm font-bold text-op-teal"
        >All Orders</router-link
      >
      <br />
      <router-link to="/s/callbacks" class="text-sm font-bold text-op-teal"
        >All Callbacks</router-link
      >
      <br />
      <router-link to="/s/restaurants" class="text-sm font-bold text-op-teal"
        >All Restaurants</router-link
      >
      <br />
      <router-link to="/s/requests" class="text-sm font-bold text-op-teal"
        >All Requests</router-link
      >
      <br />
      <router-link to="/s/admins" class="text-sm font-bold text-op-teal"
        >All Admins</router-link
      >
      <br />
      <router-link to="/s/favorites" class="text-sm font-bold text-op-teal"
        >All Favorites</router-link
      >
      <br />
      <router-link to="/s/profiles" class="text-sm font-bold text-op-teal"
        >All Profiles</router-link
      >
      <br />
      <router-link to="/s/logs" class="text-sm font-bold text-op-teal"
        >All Logs</router-link
      >
      <br />
      <router-link to="/s/phonelogs" class="text-sm font-bold text-op-teal"
        >All Phone Logs</router-link
      >
      <br />
      <router-link to="/s/partners" class="text-sm font-bold text-op-teal"
        >All Partners</router-link
      >
      <br />
    </div>
    <b-loading v-else active />
  </section>
</template>

<script>
export default {
  metaInfo() {
    return {
      title: [this.defaultTitle, "Super Index"].join(" / "),
    };
  },
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
    },
  },
};
</script>
