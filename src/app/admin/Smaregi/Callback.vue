<template>
  <div>
    <div class="mt-6 text-center text-xl font-bold text-black text-opacity-40" v-if="isValidating">
      {{ $t("admin.smaregi.authenticating") }}
    </div>
    <o-loading :is-full-page="false" :active="isValidating"></o-loading>
    <div v-if="error">
      <div class="flex space-x-4 mt-6">
        <back-button url="/admin/restaurants/" />
      </div>
      <div class="mt-6 text-center text-xl font-bold text-black text-opacity-40">
        {{ $t("admin.smaregi.authenticationError") }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import { smaregiAuth } from "@/lib/firebase/functions";

import BackButton from "@/components/BackButton.vue";

import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  components: {
    BackButton,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const code = route.query.code as string;

    const isValidating = ref(false);
    const error = ref(false);

    (async () => {
      if (code) {
        try {
          isValidating.value = true;
          const { data } = await smaregiAuth({
            code: code,
          });
          console.log("smaregiAuth", data);
          if (data.result) {
            router.push("/admin/smaregi/index");
          } else {
            error.value = true;
          }
        } finally {
          isValidating.value = false;
        }
      } else {
        error.value = true;
      }
    })();
    
    return {
      isValidating,
      error,
    };
  },
});
</script>
