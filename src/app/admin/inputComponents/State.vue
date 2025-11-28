<template>
  <div>
    <div class="pb-2 text-sm font-bold">
      {{ $t(this.state_key) }}
      <span class="text-red-700">*</span>
    </div>
    <select
      :value="modelValue"
      placeholder="select"
      @change="input"
      class="rounded-lg border border-teal-400 bg-white px-3 py-2 hover:border-teal-400 focus:ring-teal-400"
    >
      <option v-for="stateItem in states" :key="stateItem" :value="stateItem">
        {{ stateItem }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { regionalSetting } from "@/utils/utils";

export default defineComponent({
  name: "State",
  props: {
    modelValue: {
      type: String,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  setup(props, context) {
    const input = (value: any) => {
      context.emit("update:modelValue", value.target.value);
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
