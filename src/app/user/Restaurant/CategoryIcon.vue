<template>
  <div
    class="fixed left-4 bottom-24 z-10 inline-flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-op-teal bg-teal-50 pb-1.5 shadow-lg sm:bottom-28"
    @click="openGroupCategory"
  >
    <i class="material-icons mb-0.5 text-2xl text-op-teal">tune</i>
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
