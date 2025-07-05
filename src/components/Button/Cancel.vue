<template>
  <button
    @click="handleCancel"
    :disabled="disabled"
    class="b-reset-tw disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <div
      class="inline-flex h-12 w-32 items-center justify-center rounded-full bg-black/5"
    >
      <div class="text-base font-bold text-black/60">
        <slot />
      </div>
    </div>
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    disabled: {
      type: Boolean,
      required: false,
    },
  },
  emits: ["cancel"],
  setup(props, ctx) {
    const handleCancel = () => {
      ctx.emit("cancel");
    };
    return {
      handleCancel,
    };
  },
});
</script>
