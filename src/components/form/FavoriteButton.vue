<template>
  <div class="mt-2 text-center">
    <router-link :to="basePath + '/r/favorites'">
      <div
        class="bg-op-teal inline-flex h-16 items-center justify-center rounded-full shadow-sm"
        style="min-width: 16rem"
      >
        <i class="material-icons mr-2 text-2xl text-white">favorite</i>
        <div class="text-xl font-bold text-white">
          {{ $t("find.likes") }}
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
