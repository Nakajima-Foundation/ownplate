<template>
  <button
    class="inline-flex items-center justify-center rounded-full shadow-sm"
    :class="{
      'bg-op-teal': !isCancel && !isDisabled,
      'bg-op-teal-disabled': !isCancel && isDisabled,
      'cursor-pointer': !isDisabled,
    }"
    type="button"
    :disabled="isDisabled"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<!-- type が無いと form の中で submit になる。送信は t-submit の役目（呼び出し側の type が優先） -->
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  emits: ["click"],
  name: "TButton",
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
