<template>
  <div class="flex items-center">
    <div>
      <o-field :variant="variant">
        <o-select
          :modelValue="modelValue.start"
          :disabled="disabled"
          @update:modelValue="updateValueStart"
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
    <div class="px-2">-</div>
    <div>
      <o-field :variant="variant">
        <o-select :modelValue="modelValue.end" :disabled="disabled" @update:modelValue="updateValueEnd">
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
import {
  defineComponent,
} from "vue";

import {
  timeList
} from "@/config/constant";

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
      const a = {...props.modelValue};
      a.start = e;
      context.emit("update:modelValue", a);
    };
    const updateValueEnd = (e: any) => {
      const a = {...props.modelValue};
      a.end = e;
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
