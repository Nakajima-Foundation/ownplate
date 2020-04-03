<template>
  <section class="section">
    <form 
      v-show="confirmationResult === null"
      @submit.prevent="handleSubmit">
      <b-field
        :label="$t('sms.countryCode')">
        <b-select
          v-model="countryCode">
          <option
            v-for="country in countries"
            :value="country.code"
            :key="country.code">
            {{ $t(country.name) }}
          </option>
        </b-select>
      </b-field>
      <b-field 
        :type="hasError ? 'is-danger' : 'is-success'"
        :message="hasError ? $t(errors[0]) : $t('sms.notice')"
        :label="$t('sms.phonenumber')">
        <b-input type="text"
          v-model="phoneNumber"
          v-on:input="validatePhoneNumber"
          maxlength="30"
          :placeholder="$t('sms.pleasetype')" />
      </b-field>
      <div 
        id="signInButton" 
        style="margin-bottom:0.5rem" />
      <input
        type="submit" 
        class="button" 
        :value="$t('sms.send')" 
        :disabled="!readyToSendSMS" />
    </form>
    <form
      v-if="confirmationResult !== null" 
      @submit.prevent="handleCode">
      <b-field 
        :type="hasError ? 'is-danger' : 'is-success'"
        :message="hasError ? $t(errors[0]) : ''"
        :label="$t('sms.verificationCode')">
        <b-input type="text"
          v-model="verificationCode"
          v-on:input="validateVerificationCode"
          maxlength="16"
          :placeholder="$t('sms.typeVerificationCode')" />
      </b-field>
      <input
        type="submit" 
        class="button" 
        :value="$t('sms.sendVerificationCode')" 
        :disabled="!readyToSendVerificationCode" />
    </form>
  </section>
</template>

<script>
import { auth, authObject } from "~/plugins/firebase.js";

export default {
  data() {
    return {
      countries: [
        { code:"+1", name:"sms.country.us" },
        { code:"+81", name:"sms.country.ja" },
      ],
      countryCode: "+1",
      phoneNumber:"650-555-1234",
      errors:[],
      recaptchaVerifier : () => {},
      recaptchaVerified: false,
      recaptchaWidgetId: null,
      confirmationResult: null,
      verificationCode: "",
      result: {}
    }
  },
  mounted() {
    this.recaptchaVerifier = new authObject.RecaptchaVerifier('signInButton', {
      'size': 'normal',
      'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log("verified", response);
        this.recaptchaVerified = true;
      }
    });
    this.recaptchaVerifier.render().then((widgetId) => {
      this.recaptchaWidgetId = widgetId;
      console.log("widdgetId", widgetId);
    });
  },
  computed: {
    readyToSendSMS() {
      return this.recaptchaVerified && !this.hasError;
    },
    readyToSendVerificationCode() {
      return !this.hasError;
    },
    hasError() {
      return this.errors.length > 0
    }
  },
  methods: {
    validatePhoneNumber() {
      this.errors = []
      const regex = /^[0-9()\-]*$/
      if (!regex.test(this.phoneNumber)) {
        this.errors.push("sms.invalidPhoneNumber")
      }
    },
    validateVerificationCode() {
      this.errors = []
      const regex = /^[0-9]*$/
      if (!regex.test(this.verificationCode)) {
        this.errors.push("sms.invalidValidationCode")
      }
    },
    async handleSubmit() {
      console.log("submit");
      try {
        this.confirmationResult = await auth.signInWithPhoneNumber(this.countryCode + this.phoneNumber, this.recaptchaVerifier);
        console.log("result", this.confirmationResult);
      } catch(error) {
        console.log("error", error);
        this.errors = [ error.message ];
      }
    },
    async handleCode() {
      console.log("handleCode");
      this.errors = [];
      try {
        let result = await this.confirmationResult.confirm(this.verificationCode);
        console.log("success!", result);
      } catch(error) {
        console.log("error", error);
        this.errors = [ error.message ];
      }
    }
  }
}
</script>