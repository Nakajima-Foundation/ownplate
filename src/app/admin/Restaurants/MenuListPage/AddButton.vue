<template>
  <div>
    <div class="mt-4 text-center">
      <o-button
        @click="addTitle()"
        :disabled="submitting"
        class="b-reset-tw mx-2 mb-2"
      >
        <div
          class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
        >
          <i class="material-icons mr-2 text-lg text-op-teal">add</i>
          <span class="text-sm font-bold text-op-teal">{{
            $t("button.addTitle")
          }}</span>
        </div>
      </o-button>

      <o-button
        @click="addMenu()"
        :disabled="submitting"
        class="b-reset-tw mx-2 mb-2"
      >
        <div
          class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
        >
          <i class="material-icons mr-2 text-lg text-op-teal">add</i>
          <span class="text-sm font-bold text-op-teal">
            {{ $t("button.addItem") }}</span
          >
        </div>
      </o-button>
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
