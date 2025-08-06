<template>
  <div>
    <div class="pb-2 text-sm font-bold">
      {{ $t(this.state_key) }}
      <span class="text-red-700">*</span>
    </div>
    <o-field :variant="errors['state'].length > 0 ? 'danger' : 'success'">
      <select
        :modelValue="modelValue"
        placeholder="select"
        @update:modelValue="input"
        class="rounded-lg border border-teal-400 bg-white px-3 py-2 hover:border-teal-400 focus:ring-teal-400 dark:border-gray-600 dark:bg-black dark:text-white"
      >
        <option v-for="stateItem in states" :key="stateItem">
          {{ stateItem }}
        </option>
      </select>
    </o-field>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { regionalSetting } from "@/utils/utils";

export default defineComponent({
  name: "State",
  props: {
    errors: {
      type: Object,
      required: true,
    },
    modelValue: {
      type: String,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  setup(props, context) {
    const input = (value: string) => {
      context.emit("update:modelValue", value);
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
