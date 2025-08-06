<template>
  <label class="inline-flex cursor-pointer items-center">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="change"
      class="peer m-2 h-5 w-5 cursor-pointer appearance-none rounded-md border-2 shadow-sm transition-all hover:shadow-md focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:checked:border-gray-400 disabled:checked:bg-gray-400"
      :class="[
        {
          'border-red-500': variant === 'danger' && !modelValue,
          'border-red-400 checked:border-red-500 checked:bg-red-400 hover:bg-red-400 focus:bg-red-400':
            variant === 'danger',
          'border-teal-400 checked:border-teal-400 checked:bg-teal-400 hover:border-teal-400 focus:ring-teal-400':
            variant !== 'danger',
        },
      ]"
    />
    <span class="inline-block align-middle">
      <slot></slot>
    </span>
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
    disabled: {
      type: Boolean,
      required: false,
    },
    variant: {
      type: String,
      required: false,
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
