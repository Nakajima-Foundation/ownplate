<template>
  <button
    class="inline-flex items-center justify-center rounded-full shadow-sm"
    :loading="isLoading"
    :class="{
            'bg-op-teal': !isCancel && !isLoading && !isDisabled,
            'bg-op-teal-disabled': !isCancel && (isLoading || isDisabled),
            'cursor-pointer': !isDisabled
            }"
    :disabled="isLoading || isDisabled"
    @click="handleClick"
  >
    <ButtonLoading v-if="isLoading" />
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ButtonLoading from "@/components/form/Loading.vue";
export default defineComponent({
  emits: ["click"],
  name: "TButton",
  components: {
    ButtonLoading,
  },
  props: {
    isLoading: {
      type: Boolean,
      required: false,
    },
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
