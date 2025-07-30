<template>
  <label class="flex cursor-pointer items-center">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="change"
      class="peer m-2 h-5 w-5 cursor-pointer appearance-none rounded-md rounded-sm border-2 border-gray-500 shadow-sm transition-all checked:border-teal-400 checked:bg-teal-400 hover:border-teal-400 hover:shadow-md focus:ring-2 focus:ring-teal-400 focus:outline-hidden"
    />
    <slot></slot>
  </label>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  emits: ["update:modelValue"],
  name: "Checkbox",
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, ctx) {
    const change = (e) => {
      ctx.emit("update:modelValue", e.target.checked);
    };
    return {
      change,
    };
  },
});
</script>
