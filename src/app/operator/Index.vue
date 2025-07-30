<template>
  <section class="mx-auto max-w-full px-6 pt-4 pb-12">
    <div v-if="$store.getters.isSuperAdmin || $store.getters.isOperator">
      <h2>Operator Page</h2>
      <router-link to="/op/orders">All Orders</router-link>
      <br />
      <router-link to="/op/restaurants">All Restaurants</router-link>
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
    const { isNotSuperAdmin, isNotOperator } = useIsNotSuperAdmin();

    useHead(() => ({
      title: [defaultTitle, "operator index"].join(" / "),
    }));

    onMounted(() => {
      if (!store.state.user || (isNotSuperAdmin.value && isNotOperator.value)) {
        router.push("/");
      }
    });
    watch(isNotSuperAdmin, (newValue) => {
      if (newValue && isNotOperator.value) {
        router.push("/");
      }
    });
    watch(isNotOperator, (newValue) => {
      if (newValue && isNotSuperAdmin.value) {
        router.push("/");
      }
    });
    return {};
  },
});
</script>
