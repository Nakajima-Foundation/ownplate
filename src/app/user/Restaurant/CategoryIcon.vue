<template>
  <div
    class="fixed left-10 bottom-28 z-10 mb-2 inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-op-teal bg-opacity-10 shadow ring-4 ring-op-teal"
    @click="openGroupCategory"
  >
    <span class="material-icons text-2xl text-black"> category </span>
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
