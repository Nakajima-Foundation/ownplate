<template>
  <div
    class="fixed left-6 bottom-28 pb-1.5 inline-flex flex-col items-center justify-center h-20 w-20 cursor-pointer rounded-full bg-teal-50 border-2 border-op-teal shadow-lg"
    @click="openGroupCategory"
  >
    <i class="material-icons text-2xl text-op-teal mb-0.5">tune</i>
    <div class="text-xs font-bold text-op-teal">
      {{ $t("button.category") }}
    </div>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";
export default defineComponent({
  emits: ["openGroupCategory"],
  setup(props, ctx) {
    return {
      openGroupCategory: () => {
        ctx.emit("openGroupCategory");
      },
    };
  },
});
</script>
