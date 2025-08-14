<template>
  <section class="mx-auto max-w-full px-6 pt-4 pb-12">
    <div v-if="$store.getters.isSuperAdmin">
      <h2>Admin Page</h2>
      <router-link to="/s/orders" class="text-op-teal text-sm font-bold"
        >All Orders</router-link
      >
      <br />
      <router-link to="/s/callbacks" class="text-op-teal text-sm font-bold"
        >All Callbacks</router-link
      >
      <br />
      <router-link to="/s/restaurants" class="text-op-teal text-sm font-bold"
        >All Restaurants</router-link
      >
      <br />
      <router-link to="/s/requests" class="text-op-teal text-sm font-bold"
        >All Requests</router-link
      >
      <br />
      <router-link to="/s/admins" class="text-op-teal text-sm font-bold"
        >All Admins</router-link
      >
      <br />
      <router-link to="/s/favorites" class="text-op-teal text-sm font-bold"
        >All Favorites</router-link
      >
      <br />
      <router-link to="/s/profiles" class="text-op-teal text-sm font-bold"
        >All Profiles</router-link
      >
      <br />
      <router-link to="/s/logs" class="text-op-teal text-sm font-bold"
        >All Logs</router-link
      >
      <br />
      <router-link to="/s/phonelogs" class="text-op-teal text-sm font-bold"
        >All Phone Logs</router-link
      >
      <br />
      <router-link to="/s/partners" class="text-op-teal text-sm font-bold"
        >All Partners</router-link
      >
      <br />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from "vue";

import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useIsNotSuperAdmin, defaultTitle } from "@/utils/utils";
import { useHead } from "@unhead/vue";

export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRouter();
    const { isNotSuperAdmin } = useIsNotSuperAdmin();

    useHead(() => ({
      title: [defaultTitle, "Super Index"].join(" / "),
    }));

    onMounted(() => {
      if (!store.state.user || isNotSuperAdmin.value) {
        router.push("/");
      }
    });
    watch(isNotSuperAdmin, (newValue) => {
      if (newValue) {
        router.push("/");
      }
    });
    return {};
  },
});
</script>
