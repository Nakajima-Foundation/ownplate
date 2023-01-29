<template>
  <div class="mt-6 text-center">
    <router-link :to="basePath + '/r/favorites'">
      <div
        class="inline-flex h-16 items-center justify-center rounded-full bg-op-teal shadow"
        style="min-width: 16rem"
      >
        <i class="material-icons mr-2 text-2xl text-white">favorite</i>
        <div class="text-xl font-bold text-white">
          {{ $t(isInMo ? "find.favoriteShop" : "find.likes") }}
        </div>
      </div>
    </router-link>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { useBasePath } from "@/utils/utils";
import { useIsInMo } from "@/utils/utils";

export default defineComponent({
  setup() {
    const basePath = useBasePath();
    const isInMo = useIsInMo();
    return {
      basePath,
      isInMo,
    };
  },
});
</script>
