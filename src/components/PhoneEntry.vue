<template>
  <div style="margin-bottom: 1rem">
    <div class="field" :class="hasError ? 'has-error' : 'has-success'">
      <label v-if="label" class="label mb-1 block text-sm font-medium">{{
        label
      }}</label>
      <input
        type="text"
        v-model="phoneNumber"
        @input="validatePhoneNumber"
        :placeholder="placeholder"
        class="input w-full rounded border px-3 py-2"
        :class="hasError ? 'border-red-500' : 'border-gray-300'"
      />
      <p
        v-if="hasError || notice"
        class="help mt-1 text-sm"
        :class="hasError ? 'text-red-500' : 'text-green-600'"
      >
        {{ hasError ? $t(errors[0]) : notice }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import { parsePhoneNumber } from "@/utils/phoneutil";
import { stripeRegion } from "@/utils/utils";

export default defineComponent({
  props: {
    notice: {
      type: String,
      default: "",
    },
    currentNumber: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      required: true,
    },
  },
  emits: ["change"],
  setup(props, ctx) {
    const countries = stripeRegion.countries;
    const countryCode = ref(countries[0].code);

    const errors = ref<string[]>([]);
    const phoneNumber = ref(props.currentNumber);

    // BUGBUG: This code is fine for US and JP, but not sufficient for EU
    const validatePhoneNumber = () => {
      errors.value = [];
      try {
        parsePhoneNumber(countryCode.value + phoneNumber.value);
      } catch (__error) {
        errors.value.push("sms.invalidPhoneNumber");
      }
      ctx.emit("change", {
        phoneNumber: phoneNumber.value,
        countryCode: countryCode.value,
        errors: errors.value,
        // number,
      });
    };

    onMounted(() => {
      // BUGBUG: This code is sufficient for US and JP, but not for EU
      //console.log("countryCode:mount", this.countryCode);
      validatePhoneNumber();
    });
    const hasError = computed(() => {
      return errors.value.length > 0;
    });

    return {
      countryCode,
      countries,

      errors,
      phoneNumber,

      validatePhoneNumber,
      hasError,
    };
  },
});
</script>
