<template>
  <div class="flex items-center">
    <div>
      <o-field :variant="variant">
        <select
          :value="modelValue.start"
          :disabled="disabled"
          @change="updateValueStart"
          class="rounded-lg border border-teal-400 bg-white px-3 py-2 hover:border-teal-400 focus:ring-teal-400 dark:border-gray-600 dark:bg-black dark:text-white"
        >
          <option
            v-for="(timeItem, index) of timeList"
            :key="timeItem"
            :value="index === 0 ? null : (index - 1) * 30"
          >
            {{ timeItem }}
          </option>
        </select>
      </o-field>
    </div>
    <div class="px-2">-</div>
    <div>
      <o-field :variant="variant">
        <select
          :value="modelValue.end"
          :disabled="disabled"
          @change="updateValueEnd"
          class="rounded-lg border border-teal-400 bg-white px-3 py-2 hover:border-teal-400 focus:ring-teal-400 dark:border-gray-600 dark:bg-black dark:text-white"
        >
          <option
            v-for="(timeItem, index) of timeList"
            :key="timeItem"
            :value="index === 0 ? null : (index - 1) * 30"
          >
            {{ timeItem }}
          </option>
        </select>
      </o-field>
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
      a.start = e.target.value;
      context.emit("update:modelValue", a);
    };
    const updateValueEnd = (e: any) => {
      const a = { ...props.modelValue };
      a.end = e.target.value;
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
