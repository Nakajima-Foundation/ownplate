<template>
  <label class="flex items-center cursor-pointer">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="change"
      class="peer h-5 w-5 cursor-pointer rounded-md transition-all appearance-none rounded-sm shadow-sm hover:shadow-md border-2 border-gray-500 checked:bg-teal-400 checked:border-teal-400 focus:outline-hidden focus:ring-2 focus:ring-teal-400 hover:border-teal-400 m-2"
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
