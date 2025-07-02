<template>
  <button
    class="inline-flex items-center justify-center rounded-full bg-black/5 text-black/60 font-bold"
    :loading="isLoading"
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
  name: "TCancelButton",
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
