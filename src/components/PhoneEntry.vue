<template>
  <div style="margin-bottom: 1rem">
    <o-field v-if="countries.length > 1">
      <o-select v-model="countryCode">
        <option
          v-for="country in countries"
          :value="country.code"
          :key="country.code"
        >
          {{ $t(country.name) }}
        </option>
      </o-select>
    </o-field>
    <o-field
      :variant="hasError ? 'danger' : 'success'"
      :message="hasError ? $t(errors[0]) : notice"
      :label="label"
    >
      <o-input
        type="text"
        v-model="phoneNumber"
        @update:modelValue="validatePhoneNumber"
        :placeholder="placeholder"
      />
    </o-field>
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
      } catch (error) {
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
