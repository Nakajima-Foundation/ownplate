<template>
  <a
    @click="toggleFunction()"
    class="inline-flex items-center rounded-full bg-green-600/10 p-1"
  >
    <div
      class="inline-flex h-9 items-center rounded-full px-4"
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
      class="inline-flex h-9 items-center rounded-full px-4"
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

<script lang="ts">
import { defineComponent } from "vue";

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
