<template>
  <button
    class="inline-flex items-center justify-center rounded-full shadow"
    :loading="isLoading"
    :class="isLoading || isDisabled ? 'bg-op-teal-disabled' : 'bg-op-teal'"
    :disabled="isLoading || isDisabled"
    @click="handleClick"
  >
    <ButtonLoading v-if="isLoading" />
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ButtonLoading from "@/components/Button/Loading.vue";
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
