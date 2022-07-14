<template>
  <div
    class="fixed left-6 bottom-28 pb-1 inline-flex flex-col items-center justify-center h-16 w-16 cursor-pointer rounded-full bg-white shadow-lg"
    @click="openGroupCategory"
  >
    <i class="material-icons text-2xl text-op-teal">tune</i>
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
