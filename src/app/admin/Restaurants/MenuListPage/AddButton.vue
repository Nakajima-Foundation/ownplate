<template>
  <div>
    <div class="mt-4 text-center">
      <button
        @click="addTitle()"
        :disabled="submitting"
        class="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mx-2 mb-2"
      >
        <div
          class="inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
        >
          <i class="material-icons mr-2 text-lg text-op-teal">add</i>
          <span class="text-sm font-bold text-op-teal">{{
            $t("button.addTitle")
          }}</span>
        </div>
      </button>

      <button
        @click="addMenu()"
        :disabled="submitting"
        class="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mx-2 mb-2"
      >
        <div
          class="inline-flex h-9 items-center justify-center rounded-full bg-black/5 px-4"
        >
          <i class="material-icons mr-2 text-lg text-op-teal">add</i>
          <span class="text-sm font-bold text-op-teal">
            {{ $t("button.addItem") }}</span
          >
        </div>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  emits: ["addTitle", "addMenu"],
  props: {
    submitting: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, ctx) {
    const addTitle = () => {
      ctx.emit("addTitle");
    };
    const addMenu = () => {
      ctx.emit("addMenu");
    };
    return {
      addTitle,
      addMenu,
    };
  },
});
</script>
