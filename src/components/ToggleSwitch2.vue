<template>
  <a class="inline-flex items-center rounded-full bg-green-600/10 p-1">
    <div
      v-for="(v, k) in toggleValues"
      :key="k"
      class="inline-flex h-9 items-center rounded-full px-4"
      :class="modelValue === k ? 'bg-green-600' : ''"
      @click="toggleFunction(k)"
    >
      <div
        class="text-sm font-bold"
        :class="modelValue === k ? 'text-white' : 'text-green-600'"
      >
        {{ $t("editMenu." + v.name) }}
      </div>
    </div>
  </a>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  emits: ["update:modelValue"],
  props: {
    modelValue: {
      type: Number,
      required: true,
    },
    toggleValues: {
      type: Array,
      required: true,
    },
  },
  setup(props, ctx) {
    const toggleFunction = (e: number) => {
      ctx.emit("update:modelValue", e);
    };
    return {
      toggleFunction,
    };
  },
});
</script>
