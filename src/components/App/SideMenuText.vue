<template>
  <div class="mt-2 text-center">
    <router-link :to="to">
      <div
        class="inline-flex items-center justify-center"
        @click="handleClose()"
      >
        <!-- with icon -->
        <template v-if="icon">
          <span class="text-sm text-op-teal font-bold">
            {{ $t(text) }}
          </span>
          <i class="material-icons ml-0.5 text-lg text-op-teal">{{ icon }}</i>
        </template>
        <!-- without icon -->
        <div
          v-else
          class="text-sm font-bold text-op-teal"
          @click="handleClose()"
        >
          {{ $t(text) }}
        </div>
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
      required: false,
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
