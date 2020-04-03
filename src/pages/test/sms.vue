<template>
  <section class="section">
    <form 
      v-if="confirmationResult === null"
      @submit.prevent="handleSubmit">
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
      v-else 
      @submit.prevent="handleCode">
      <b-field 
        :type="hasError ? 'is-danger' : 'is-success'"
        :message="hasError ? $t(errors[0]) : ''"
        :label="$t('sms.verificationCode')">
        <b-input type="text"
          v-model="verificationCode"
          v-on:input="validateVerificationCode"
          maxlength="30"
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
      phoneNumber:"+1 650-555-1234",
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
      return this.recaptchaVerified;
    },
    readyToSendVerificationCode() {
      return this.confirmationResult;
    },
    hasError() {
      return this.errors.length > 0
    }
  },
  methods: {
    validatePhoneNumber() {
      console.log(this.phoneNumber);
    },
    validateVerificationCode() {
      console.log(this.verificationCode);
    },
    async handleSubmit() {
      console.log("submit");
      try {
        this.confirmationResult = await auth.signInWithPhoneNumber(this.phoneNumber, this.recaptchaVerifier);
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