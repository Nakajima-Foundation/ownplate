<template>
  <button
    @click="handleSubmit"
    :disabled="disabled"
    class="b-reset-tw disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <div
      class="inline-flex h-12 w-32 items-center justify-center rounded-full bg-op-teal shadow-sm"
    >
      <ButtonLoading v-if="isLoading" />
      <div class="text-base font-bold text-white">
        <slot />
      </div>
    </div>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ButtonLoading from "@/components/Button/Loading.vue";

export default defineComponent({
  components: {
    ButtonLoading,
  },
  props: {
    isLoading: {
      type: Boolean,
      required: false,
    },
    disabled: {
      type: Boolean,
      required: false,
    },
  },
  emits: ["submit"],
  setup(props, ctx) {
    const handleSubmit = () => {
      ctx.emit("submit");
    };
    return {
      handleSubmit,
    };
  },
});
</script>
