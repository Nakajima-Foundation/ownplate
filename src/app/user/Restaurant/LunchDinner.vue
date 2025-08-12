<template>
  <div class="p-4">
    <div class="text-ms font-bold">
      {{ $t("shopInfo.lunchOrDinner") }}
    </div>

    <div class="mt2 grid grid-cols-2 gap-2">
      <!-- lunch -->
      <div
        class="h-full w-full rounded-lg bg-white p-3 shadow-sm"
        :class="
          modelValue === 'lunch'
            ? 'border-op-teal text-op-teal border-2'
            : 'cursor-pointer text-black/40'
        "
        @click="input('lunch')"
      >
        <i class="material-icons w-full text-center"> lunch_dining </i>
        <div class="-mt-0.5 text-center text-lg font-bold tracking-tighter">
          {{ $t("shopInfo.lunch") }}
        </div>
      </div>
      <!-- dinner -->
      <div
        class="h-full w-full rounded-lg bg-white p-3 shadow-sm"
        :class="
          modelValue === 'dinner'
            ? 'border-op-teal text-op-teal border-2'
            : 'cursor-pointer text-black/40'
        "
        @click="input('dinner')"
      >
        <i class="material-icons w-full text-center"> dinner_dining </i>
        <div class="-mt-0.5 text-center text-lg font-bold">
          {{ $t("shopInfo.dinner") }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useDialogStore } from "@/store/dialog";

export default defineComponent({
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    hasDinnerOnlyOrder: {
      type: Boolean,
      required: true,
    },
    hasLunchOnlyOrder: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  setup(props, ctx) {
    const dialogStore = useDialogStore();
    const popup = ref(false);

    const input = (value: string) => {
      if (
        (value === "dinner" && props.hasLunchOnlyOrder) ||
        (value === "lunch" && props.hasDinnerOnlyOrder)
      ) {
        dialogStore.setAlert({
          title: "lunchOrDinner.alert." + value + ".title",
          code: "lunchOrDinner.alert." + value + ".body",
          callback: () => {
            ctx.emit("update:modelValue", value);
          },
        });
      } else {
        ctx.emit("update:modelValue", value);
      }
    };
    return {
      input,
      popup,
    };
  },
});
</script>
