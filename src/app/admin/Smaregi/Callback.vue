<template>
  <div>
    <div
      class="mt-4 text-center text-xl font-bold text-black/40"
      v-if="isValidating"
    >
      {{ $t("admin.smaregi.authenticating") }}
    </div>
    <Loading v-if="isValidating" />
    <div v-if="error">
      <div class="mt-4 flex space-x-4">
        <back-button url="/admin/restaurants/" />
      </div>
      <div class="mt-4 text-center text-xl font-bold text-black/40">
        {{ $t("admin.smaregi.authenticationError") }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { smaregiAuth } from "@/lib/firebase/functions";

import BackButton from "@/components/BackButton.vue";
import Loading from "@/components/Loading.vue";

export default defineComponent({
  components: {
    BackButton,
    Loading,
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
