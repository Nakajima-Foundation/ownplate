<template>
  <a
    @click="toggleFunction()"
    class="inline-flex items-center rounded-full p-1 bg-green-600 bg-opacity-10"
  >
    <div
      class="inline-flex items-center rounded-full h-9 px-4"
      :class="toggleState ? 'bg-green-600' : ''"
    >
      <div
        class="text-sm font-bold"
        :class="toggleState ? 'text-white' : 'text-green-600'"
      >
        {{ $t(onName) }}
      </div>
    </div>
    <div
      class="inline-flex items-center rounded-full h-9 px-4"
      :class="toggleState ? '' : 'bg-green-600'"
    >
      <div
        class="text-sm font-bold"
        :class="toggleState ? 'text-green-600' : 'text-white'"
      >
        {{ $t(offName) }}
      </div>
    </div>
  </a>
</template>

<script>
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  emits: ["toggleFunction"],
  props: {
    toggleState: {
      type: Boolean,
      required: true,
    },
    onName: {
      type: String,
      required: true,
    },
    offName: {
      type: String,
      required: true,
    },
  },
  setup(props, ctx) {
    const toggleFunction = () => {
      ctx.emit("toggleFunction");
    };
    return {
      toggleFunction,
    };
  },
});
</script>
