<template>
  <button
    class="inline-flex items-center justify-center rounded-full shadow-sm"
    :class="{
      'bg-op-teal': !isCancel && !isDisabled,
      'bg-op-teal-disabled': !isCancel && isDisabled,
      'cursor-pointer': !isDisabled,
    }"
    type="submit"
    :disabled="isDisabled"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  emits: ["click"],
  name: "TSubmit",
  props: {
    isDisabled: {
      type: Boolean,
      required: false,
    },
    isCancel: {
      type: Boolean,
      required: false,
    },
  },
  setup(props, ctx) {
    const handleClick = () => {
      ctx.emit("click");
    };
    return {
      handleClick,
    };
  },
});
</script>
