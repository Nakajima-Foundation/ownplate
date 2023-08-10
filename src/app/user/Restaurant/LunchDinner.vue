<template>
  <div class="p-4">
    <div class="text-ms font-bold">
      {{ $t("shopInfo.lunchOrDinner") }}
    </div>

    <div class="mt2 grid grid-cols-2 gap-2">
      <!-- lunch -->
      <div
        class="h-full w-full rounded-lg bg-white p-3 shadow"
        :class="
          modelValue === 'lunch'
            ? 'border-2 border-op-teal text-op-teal'
            : 'cursor-pointer text-black text-opacity-40'
        "
        @click="$emit('update:modelValue', 'lunch')"
      >
        <i class="material-icons w-full text-center"> lunch_dining </i>
        <div class="-mt-0.5 text-center text-lg font-bold tracking-tighter">
          {{ $t("shopInfo.lunch") }}
        </div>
      </div>
      <!-- dinner -->
      <div
        class="h-full w-full rounded-lg bg-white p-3 shadow"
        :class="
          modelValue === 'dinner'
            ? 'border-2 border-op-teal text-op-teal'
            : 'cursor-pointer text-black text-opacity-40'
        "
        @click="$emit('update:modelValue', 'dinner')"
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
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    modelValue: {
      type: String,
      required: true,
    },
  },
});
</script>
