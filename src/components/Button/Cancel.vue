<template>
  <o-button @click="handleCancel" :disabled="disabled" class="b-reset-tw">
    <div
      class="inline-flex h-12 w-32 items-center justify-center rounded-full bg-black bg-opacity-5"
    >
      <div class="text-base font-bold">
        <slot />
      </div>
    </div>
  </o-button>
</template>

<script>
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
