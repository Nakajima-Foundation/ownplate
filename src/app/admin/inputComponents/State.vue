<template>
  <div>
    <div class="pb-2 text-sm font-bold">
      {{ $t(state_key) }}
      <span class="text-red-700">*</span>
    </div>
    <select
      :value="modelValue"
      @change="input"
      class="rounded-lg border bg-white px-3 py-2 focus:ring-teal-400"
      :class="
        error.length > 0
          ? 'border-red-500 hover:border-red-500'
          : 'border-teal-400 hover:border-teal-400'
      "
    >
      <option value="" disabled>
        {{ $t(state_key) }}
      </option>
      <option v-for="stateItem in states" :key="stateItem" :value="stateItem">
        {{ stateItem }}
      </option>
    </select>
    <p v-if="error.length > 0" class="mt-1 text-sm font-bold text-red-700">
      {{ $t(error[0]) }}
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { regionalSetting } from "@/utils/utils";

export default defineComponent({
  name: "State",
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    error: {
      type: Array as PropType<string[]>,
      required: false,
      default: () => [],
    },
  },
  emits: ["update:modelValue"],
  setup(props, context) {
    const input = (value: Event) => {
      if (value.target instanceof HTMLSelectElement) {
        context.emit("update:modelValue", value.target.value);
      }
    };

    const states = regionalSetting.AddressStates;
    const state_key = regionalSetting.StateKey || "shopInfo.state";

    return {
      states,
      state_key,
      input,
    };
  },
});
</script>
