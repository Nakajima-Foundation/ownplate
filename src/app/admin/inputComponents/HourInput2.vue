<template>
  <div class="flex items-center">
    <div>
      <select
        :value="modelValue"
        :disabled="disabled"
        @change="updateValue"
        class="rounded-lg border-2 bg-white px-3 py-2 dark:border-gray-600 dark:bg-black dark:text-white"
        :class="
          variant === 'danger'
            ? 'border-red-400 hover:border-red-400 focus:ring-red-400'
            : disabled
              ? 'border-gray-400 hover:border-gray-400 focus:ring-gray-400'
              : 'border-teal-400 hover:border-teal-400 focus:ring-teal-400'
        "
      >
        <option
          v-for="(timeItem, index) of timeList"
          :key="timeItem"
          :value="index === 0 ? null : (index - 1) * 10"
        >
          {{ timeItem }}
        </option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { timeList2 as timeList } from "@/config/constant";

export default defineComponent({
  name: "HoursInput",
  props: {
    disabled: {
      type: Boolean,
      required: true,
    },
    variant: {
      type: String,
      required: true,
    },
    modelValue: {
      type: Number,
      required: false,
      default: null,
    },
  },
  emits: ["update:modelValue"],
  setup(props, context) {
    const updateValue = (e) => {
      context.emit("update:modelValue", Number(e.target.value));
    };

    return {
      updateValue,
      timeList,
    };
  },
});
</script>
