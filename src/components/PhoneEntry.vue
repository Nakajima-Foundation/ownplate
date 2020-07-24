<template>
  <div style="margin-bottom:1rem">
    <b-field v-if="countries.length > 1">
      <b-select v-model="countryCode">
        <option
          v-for="country in countries"
          :value="country.code"
          :key="country.code"
        >{{ $t(country.name) }}</option>
      </b-select>
    </b-field>
    <b-field
      :type="hasError ? 'is-danger' : 'is-success'"
      :message="hasError ? $t(errors[0]) : notice"
      :label="label"
    >
      <b-input
        type="text"
        v-model="phoneNumber"
        v-on:input="validatePhoneNumber"
        :placeholder="placeholder"
      />
    </b-field>
  </div>
</template>

<script>
import { parsePhoneNumber } from "~/plugins/phoneutil.js";

export default {
  props: {
    notice: {
      type: String,
      default: ""
    },
    currentNumber: {
      type: String,
      default: ""
    },
    label: {
      type: String,
      default: ""
    },
    placeholder: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      countryCode: "+1",
      errors: [],
      phoneNumber: this.currentNumber
    };
  },
  mounted() {
    // BUGBUG: This code is sufficient for US and JP, but not for EU
    this.countryCode = this.countries[0].code;
    //console.log("countryCode:mount", this.countryCode);
    this.validatePhoneNumber();
  },
  computed: {
    countries() {
      return this.$store.getters.stripeRegion.countries;
    },
    hasError() {
      return this.errors.length > 0;
    }
  },
  methods: {
    // BUGBUG: This code is fine for US and JP, but not sufficient for EU
    validatePhoneNumber() {
      this.errors = [];
      try {
        const number = parsePhoneNumber(this.countryCode + this.phoneNumber);
      } catch (error) {
        this.errors.push("sms.invalidPhoneNumber");
      }
      this.$emit("change", {
        phoneNumber: this.phoneNumber,
        countryCode: this.countryCode,
        errors: this.errors
        // number,
      });
    }
  }
};
</script>
