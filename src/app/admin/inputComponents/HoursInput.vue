<template>
  <div class="flex items-center">
    <div>
      <select
        :value="modelValue.start"
        :disabled="disabled"
        @change="updateValueStart"
        class="rounded-lg border-2 bg-white px-3 py-2"
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
          :value="index === 0 ? null : (index - 1) * 30"
        >
          {{ timeItem }}
        </option>
      </select>
    </div>
    <div class="px-2">-</div>
    <div>
      <select
        :value="modelValue.end"
        :disabled="disabled"
        @change="updateValueEnd"
        class="rounded-lg border-2 bg-white px-3 py-2"
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
          :value="index === 0 ? null : (index - 1) * 30"
        >
          {{ timeItem }}
        </option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { timeList } from "@/config/constant";

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
      type: Object,
      required: true,
      default: () => ({}),
    },
  },
  emits: ["update:modelValue"],
  setup(props, context) {
    const updateValueStart = (e: any) => {
      const a = { ...props.modelValue };
      a.start = Number(e.target.value);
      context.emit("update:modelValue", a);
    };
    const updateValueEnd = (e: any) => {
      const a = { ...props.modelValue };
      a.end = Number(e.target.value);
      context.emit("update:modelValue", a);
    };

    return {
      updateValueStart,
      updateValueEnd,
      timeList,
    };
  },
});
</script>
