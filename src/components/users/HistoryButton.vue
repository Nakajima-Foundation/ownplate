<template>
  <div class="text-center">
    <router-link :to="basePath + '/u/history'">
      <div
        class="inline-flex h-16 items-center justify-center rounded-full bg-op-teal shadow"
        style="min-width: 16rem"
      >
        <i class="material-icons mr-2 text-2xl text-white">history</i>
        <div class="text-xl font-bold text-white">
          {{ $t("order.history") }}
        </div>
      </div>
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useBasePath } from "@/utils/utils";

export default defineComponent({
  setup() {
    const basePath = useBasePath();
    return {
      basePath,
    };
  },
});
</script>
