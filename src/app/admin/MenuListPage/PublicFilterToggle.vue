<template>
  <a
    @click="publicFilterToggle()"
    class="inline-flex items-center rounded-full p-1 bg-green-600 bg-opacity-10"
  >
    <div
      class="inline-flex items-center rounded-full h-9 px-4"
      :class="publicFilter ? '' : 'bg-green-600'"
    >
      <div
        class="text-sm font-bold"
        :class="publicFilter ? 'text-green-600' : 'text-white'"
      >
        {{ $t("editMenu.showAllMenu") }}
      </div>
    </div>
    <div
      class="inline-flex items-center rounded-full h-9 px-4"
      :class="publicFilter ? 'bg-green-600' : ''"
    >
      <div
        class="text-sm font-bold"
        :class="publicFilter ? 'text-white' : 'text-green-600'"
      >
        {{ $t("editMenu.showPublicMenu") }}
      </div>
    </div>
  </a>
</template>

<script>
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  emits: ["publicFilterToggle"],
  props: {
    publicFilter: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, ctx) {
    const publicFilterToggle = () => {
      ctx.emit("publicFilterToggle");
    };
    return {
      publicFilterToggle,
    };
  },
});
</script>
