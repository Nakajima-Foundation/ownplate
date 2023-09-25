<template>
  <div class="flex items-center">
    <div>
      <o-field :variant="variant">
        <o-select
          :modelValue="modelValue"
          :disabled="disabled"
          @update:modelValue="updateValue"
        >
          <option
            v-for="(timeItem, index) of timeList"
            :key="timeItem"
            :value="index === 0 ? null : (index - 1) * 30"
          >
            {{ timeItem }}
          </option>
        </o-select>
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
      type: Number,
      required: false,
      default: null,
    },
  },
  emits: ["update:modelValue"],
  setup(props, context) {
    const updateValue = (e: number) => {
      context.emit("update:modelValue", e);
    };

    return {
      updateValue,
      timeList,
    };
  },
});
</script>
