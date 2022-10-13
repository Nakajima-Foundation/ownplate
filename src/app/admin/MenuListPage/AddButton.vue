<template>
  <div>
    <div class="mt-4 text-center">
      <b-button
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
      </b-button>

      <b-button
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
      </b-button>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";

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
