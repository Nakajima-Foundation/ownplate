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
      verificationCode: ""
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
    handleSubmit() {
      console.log("submit");
      auth.signInWithPhoneNumber(this.phoneNumber, this.recaptchaVerifier)
        .then((confirmationResult) => {
          // SMS sent. Prompt user to type the code from the message, then sign the
          // user in with confirmationResult.confirm(code).
          console.log("result", confirmationResult);
          this.confirmationResult = confirmationResult;
        }).catch((error) => {
          // Error; SMS not sent
          // ...
          console.log("error", error);
          this.errors = [ error.message ];
        });
    },
    handleCode() {
      console.log("handleCode");
      this.errors = [];
      this.confirmationResult.confirm(this.verificationCode).then((result)=>{
        console.log("success!", result);
      }).catch((error)=> {
        console.log("error", error);
        this.errors = [ error.message ];
      });
    }
  }
}
</script>