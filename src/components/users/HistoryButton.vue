<template>
  <div class="text-center">
    <router-link :to="basePath + '/u/history'">
      <div
        class="inline-flex justify-center items-center h-16 rounded-full bg-op-teal shadow"
        style="min-width: 16rem"
      >
        <i class="material-icons text-2xl text-white mr-2">history</i>
        <div class="text-xl font-bold text-white">
          {{ $t("order.history") }}
        </div>
      </div>
    </router-link>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";
import { useBasePath } from "@/utils/utils";

export default defineComponent({
  setup(_, ctx) {
    const basePath = useBasePath(ctx.root);
    return {
      basePath,
    };
  },
});
</script>
