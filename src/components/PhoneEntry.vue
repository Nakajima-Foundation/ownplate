<template>
  <div>
    <b-field v-if="countries.length > 1" :label="$t('sms.countryCode')">
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
      :label="$t('sms.phonenumber')"
    >
      <b-input
        type="text"
        v-model="phoneNumber"
        v-on:input="validatePhoneNumber"
        maxlength="30"
        :placeholder="$t('sms.pleasetype')"
      />
    </b-field>
  </div>
</template>

<script>
import { parsePhoneNumber, formatNational } from "~/plugins/phoneutil.js";

export default {
  props: {
    notice: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      countryCode: "+1",
      errors: [],
      phoneNumber: ""
    };
  },
  mounted() {
    this.countryCode = this.countries[0].code;
    console.log("countryCode:mount", this.countryCode);
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
    validatePhoneNumber() {
      this.errors = [];
      try {
        const number = parsePhoneNumber(this.countryCode + this.phoneNumber);
        console.log(number);
      } catch (error) {
        this.errors.push("sms.invalidPhoneNumber");
      }
    }
  }
};
</script>
