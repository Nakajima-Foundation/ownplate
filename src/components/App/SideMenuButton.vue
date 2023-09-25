<template>
  <div class="mt-2 text-center">
    <router-link :to="to">
      <div
        class="inline-flex h-12 w-56 items-center justify-center rounded-full bg-op-teal font-bold text-white"
        @click="handleClose()"
      >
        <i class="material-icons mr-2">{{ icon }}</i>
        <span>{{ $t(text) }}</span>
      </div>
    </router-link>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    to: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  emits: ["handleClose"],
  setup(_, ctx) {
    const handleClose = () => {
      ctx.emit("handleClose");
    };
    return {
      handleClose,
    };
  },
});
</script>
