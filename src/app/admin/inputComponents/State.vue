<template>
  <div>
    <div class="pb-2 text-sm font-bold">
      {{ $t(this.state_key) }}
      <span class="text-red-700">*</span>
    </div>
    <o-field
      :variant="errors['state'].length > 0 ? 'danger' : 'success'"
    >
      <o-select :modelValue="modelValue" placeholder="select" @update:modelValue="input">
        <option v-for="stateItem in states" :key="stateItem">
          {{ stateItem }}
        </option>
      </o-select>
    </o-field>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
} from "vue";

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
